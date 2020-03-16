defmodule EdMarkaz.Supplier do
	use GenServer

	def init(args) do
		{:ok, args}
	end

	def start_link({id}) do
		IO.puts "initting supplier #{id}"

		# state is school_id, map of writes, map of db.
		{sync_state, writes} = EdMarkaz.Store.Supplier.load(id)

		GenServer.start_link(
			__MODULE__,
			{id, writes, sync_state},
			name: {:via, Registry, {EdMarkaz.SupplierRegistry, id}})
	end

	# API

	def sync_changes(id, client_id, changes, last_sync_date) do
		GenServer.call(via(id), {:sync_changes, client_id, changes, last_sync_date}, 60000)
	end

	def get_sync_state(id) do
		GenServer.call(via(id), {:get_sync_state})
	end

	def get_school_from_masked(id, masked_num) do
		GenServer.call(via(id), {:school_from_masked_num, masked_num})
	end

	def reload(id) do
		GenServer.call(via(id), {:reload})
	end

	def exists(id) do
		{:ok, res} = Postgrex.query(EdMarkaz.DB, "Select count(*) from suppliers where id=$1", [id])

		[[num]] = res.rows

		num != 0
	end

	def save_profile(id, profile) do
		changes = prepare_changes([
			%{
				type: "MERGE",
				path: ["sync_state", "profile"],
				value: profile
			}
		])

		time = :os.system_time(:millisecond)

		%{new_writes: new_writes} = GenServer.call(via(id), {:sync_changes, "backend", changes, time}, 60000)

		{:ok, new_writes}
	end

	def reserve_masked_number(id, school_id, %{"number" => number, "name" => name} = user, client_id, last_sync_date) do
		sync_state = EdMarkaz.Supplier.get_sync_state(id)

		# TODO: should first check if this school is already assigned a number

		mask_number_bank = 0..99 |> Enum.map(fn x -> "0#{4232500600 + x}" end)

		available_numbers = mask_number_bank
			|> Enum.filter(fn num -> Dynamic.get(sync_state, ["mask_pairs", num, "status"]) != "USED" end)

		time = :os.system_time(:millisecond)

		case available_numbers do
			[] -> {:error, "No numbers available"}
			_ ->
				num = Enum.random(available_numbers)
				writes = [
					%{
						type: "MERGE",
						path: ["sync_state", "mask_pairs", num],
						value: %{
							"status" => "USED",
							"school_id" => school_id
						},
						date: time,
						client_id: client_id
					},
					%{
						type: "MERGE",
						path: ["sync_state", "matches", school_id, "masked_number"],
						value: num,
						date: time,
						client_id: client_id
					},
					%{
						type: "MERGE",
						path: ["sync_state", "matches", school_id, "status"],
						value: "IN_PROGRESS",
						date: time,
						client_id: client_id
					},
					%{
						type: "MERGE",
						path: ["sync_state", "matches", school_id, "history", "#{time}"],
						value: %{
							"event" => "REVEAL_NUMBER",
							"time" => time,
							"user" => user,
						},
						date: time,
						client_id: client_id
					}
				]

				changes = prepare_changes(writes)

				%{new_writes: new_writes} = GenServer.call(via(id), {:sync_changes, client_id, changes, last_sync_date})

				{:ok, rpc_succeed(writes)}
		end
	end

	def release_masked_number(id, school_id, %{"number" => number, "name" => name} = user, client_id, last_sync_date) do
		sync_state = EdMarkaz.Supplier.get_sync_state(id)

		masked_num = Dynamic.get(sync_state, ["matches", school_id, "masked_number"])
		time = :os.system_time(:millisecond)

		event = %{
			"event" => "MARK_DONE",
			"time" => time,
			"user" => user
		}

		writes = [
			%{
				type: "MERGE",
				path: ["sync_state", "mask_pairs", masked_num],
				value: %{
					"status" => "FREE"
				},
				date: time,
				client_id: client_id
			},
			%{
				type: "MERGE",
				path: ["sync_state", "matches", school_id, "status"],
				value: "DONE",
				date: time,
				client_id: client_id
			},
			%{
				type: "MERGE",
				path: ["sync_state", "matches", school_id, "masked_number"],
				value: "",
				date: time,
				client_id: client_id
			},
			%{
				type: "MERGE",
				path: ["sync_state", "matches", school_id, "history", "#{time}"],
				value: event
			}
		]

		changes = prepare_changes(writes)

		%{new_writes: new_writes} = GenServer.call(via(id), {:sync_changes, client_id, changes, last_sync_date})

		{:ok, rpc_succeed(writes)}

	end

	def place_order(supplier_id, product, school_code, client_id) do

		time = :os.system_time(:millisecond)

		event = %{
			"event" => "ORDER_PLACED",
			"time" => time,
			"meta" => %{
				"school_id" => school_code,
				"product_id" => Map.get(product, "id"),
				"sales_rep" => "",
				"call_one" => "",
				"call_two" => "",
				"actual_product_ordered" => "",
				"quantity" => "1",
				"expected_completion_date" => time,
				"expected_date_of_delivery" => time,
				"actual_date_of_delivery" => time,
				"total_amount" => "0",
				"payment_received" => "NO",
				"cancellation_reason" => "",
				"status" => "ORDER_PLACED",
				"notes" => ""
			},
			"user" => %{
				"name" => "",
				"number" => ""
			},
			"verified" => "NOT_VERIFIED"
		}

		writes = [
			%{
				type: "MERGE",
				path: ["sync_state", "matches", school_code, "status"],
				value: "ORDERED",
				date: :os.system_time(:millisecond),
				client_id: client_id
			},
			%{
				type: "MERGE",
				path: ["sync_state", "matches", school_code, "history", "#{time}"],
				value: event,
				date: :os.system_time(:millisecond),
				client_id: client_id
			}
		]

		changes = prepare_changes(writes)

		GenServer.call(via(supplier_id), {:sync_changes, client_id, changes, :os.system_time(:millisecond)})

	end

	def update_order_meta( order, meta, supplier_id, client_id) do

		order_time = Map.get(order, "time")
		school_code = get_in(order, ["meta", "school_id"])
		path = ["sync_state", "matches", school_code, "history", "#{order_time}", "meta"]

		writes = meta
			|> Enum.reduce(
				[],
				fn ({key, val}, acc) ->
					write = %{
						type: "MERGE",
						path: path ++ ["#{key}"],
						value: val,
					}
					[ write | acc ]
				end
			)
		changes = prepare_changes(writes)
		GenServer.call(via(supplier_id), {:sync_changes, client_id, changes, :os.system_time(:millisecond)})

		{:ok, "UPDATE SUCCESSFULL"}
	end

	def manage_order( type, order, supplier_id, client_id, product) do

		product_name = Map.get(product, "title")
		order_time = Map.get(order, "time")
		school_code = get_in(order, ["meta", "school_id"])
		path = ["sync_state", "matches", school_code, "history", "#{order_time}", "verified"]

		writes = [
			%{
				type: "MERGE",
				path: path,
				value: type,
				date: :os.system_time(:millisecond),
				client_id: client_id
			}
		]

		changes = prepare_changes(writes)
		GenServer.call(via(supplier_id), {:sync_changes, client_id, changes, :os.system_time(:millisecond)})

		if type === "VERIFIED" do
			notify_main(supplier_id ,"An order has been placed for #{product_name}. Please visit https://supplier.ilmexchange.com for more details.")
		end

		{:ok, "ORDER #{type} Successfully"}
	end

	def notify_main(id, message) do

		sync_state = get_sync_state(id)
		numbers = Dynamic.get(sync_state,["numbers"])

		if numbers !== nil do
			main_number = numbers
			|> Enum.filter( fn ({key, val}) -> val["type"] !== nil end )

			if main_number !== [] do
				[number | _] = main_number
				|> Enum.map(fn {k,v} -> k end)

				spawn fn ->
					EdMarkaz.Contegris.send_sms(number, message)
				end
			end
		end
	end

	def prepare_changes(changes) do

		# takes an array of changes which are %{ type: "MERGE" | "DELETE", path: [], value: any} and generates the map needed for sync_changes

		changes
		|> Enum.map(fn %{type: type, path: path, value: value} -> {
			Enum.join(path, ","), %{
				"action" => %{
					"path" => path,
					"type" => type,
					"value" => value
				},
				"date" => :os.system_time(:millisecond)
			}
		} end)
		|> Enum.into(%{})

	end

	def get_last_caller(id, school_id) do
		sync_state = EdMarkaz.Supplier.get_sync_state(id)

		history = Dynamic.get(sync_state, ["matches", school_id, "history"])
		# get the latest call_start or call_end event
		{_, %{"user" => %{"number" => number}}} = history
			|> Enum.filter(fn {_, %{"event" => event}} -> event == "CALL_START" end)
			|> Enum.sort(fn( {t1 , _}, {t2, _} ) -> t1 > t2 end)
			|> Enum.at(-1)

		number
	end

	def call_event(event_type, id, caller_id, school_id, meta) do
		sync_state = EdMarkaz.Supplier.get_sync_state(id)

		time = :os.system_time(:millisecond)
		path = ["sync_state", "matches", school_id, "history", "#{time}"]

		value = case meta do
			nil -> %{
				"event" => event_type,
				"time" => time,
				"user" => %{
					"number" => caller_id,
					"name" => Dynamic.get(sync_state, ["numbers", caller_id, "name"])
				}
			}
			other ->
				%{
					"event" => event_type,
					"time" => time,
					"user" => %{
						"number" => caller_id,
						"name" => Dynamic.get(sync_state, ["numbers", caller_id, "name"])
					},
					"meta" => meta
				}
		end

		spawn fn ->
			EdMarkaz.CallCenter.broadcast("CALL", Enum.join(path,"-"), value )
		end

		changes = %{
			Enum.join(path, ",") => %{
				"action" => %{
					"path" => path,
					"type" => "MERGE",
					"value" => value
				},
				"date" => time
			}
		}

		GenServer.call(via(id), {:sync_changes, "elixir", changes, time})
	end

	# SERVER

	def handle_call({:school_from_masked_num, masked_num}, _from, {id, writes, sync_state} = state) do

		school_id = Dynamic.get(sync_state, ["mask_pairs", masked_num, "school_id"])
		{:reply, school_id, state}
	end

	def handle_call({:reload}, _from, {id, writes, sync_state} = state) do
		{ new_sync_state, new_writes } = EdMarkaz.Store.Supplier.load(id)

		{:reply, :ok, {id, new_sync_state, new_writes}}
	end

	def handle_call({:sync_changes, client_id, changes, last_sync_date}, _from, {id, writes, sync_state} = state) do

		# map of changes.
		# key is path separated by comma
		# value is { action: {path, value, type}, date}

		# make sure we aren't missing any writes between last sync_date and the least path_date.

		# This is happening way more than expected. It should only happen for very out of date clients - which should not be the case in 1 day and no GC
		min_write_date = if writes != %{} do

			{_, %{"date" => mwd }} = writes
				|> Enum.min_by(fn {path_string, %{"date" => path_date}} -> path_date end)

			mwd
		end

		have_all_in_memory? = min_write_date < last_sync_date

		writes = if not have_all_in_memory? do
				case EdMarkaz.Store.Supplier.get_writes(id, last_sync_date) do
					{:ok, aug_writes} ->
						# whats in aug_writes that isnt in writes??
						IO.puts "SUCCESSFUL DB RECOVERY @ #{:os.system_time(:millisecond)}. last_sync_date: #{last_sync_date} min_write_date: #{min_write_date}"
						aug_writes
					{:error, err} ->
						IO.puts "ERROR ON DB RECOVERY"
						IO.inspect err
						writes
				end
		else
			writes
		end

		# end weird section

		{nextSyncState, nextWrites, new_writes, last_date} = changes
		|> Enum.sort(fn({ _, %{"date" => d1}}, {_, %{"date" => d2}}) -> d1 < d2 end)
		|> Enum.reduce(
			{sync_state, writes, %{}, 0},
			fn({path_key, payload}, {agg_sync_state, agg_writes, agg_new_writes, max_date}) ->

				%{
					"action" => %{
						"path" => path,
						"type" => type,
						"value" => value
					},
					"date" => date
				} = payload

				[prefix | p ] = path

				p_key = Enum.join(p, ",")
				write = %{
					"date" => date,
					"value" => value,
					"path" => path,
					"type" => type,
					"client_id" => client_id
				}

				case type do
					"MERGE" ->
						case Map.get(agg_writes, p_key) do
							nil ->
								{
									Dynamic.put(agg_sync_state, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date, "value" => prev_value} when prev_date <= date ->
								{
									Dynamic.put(agg_sync_state, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date, "value" => prev_value} when prev_date > date ->
								IO.puts "#{id}: #{prev_date} is more recent than #{date}. current time is #{:os.system_time(:millisecond)}"
								# IO.inspect write
								{
									agg_sync_state,
									agg_writes,
									agg_new_writes,
									max_date
								}
							other ->
								IO.puts "OTHER!!!!!!!!!!!!!"
								IO.inspect other
								{
									Dynamic.put(agg_sync_state, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
						end

					"DELETE" ->
						case Map.get(agg_writes, p_key) do
							nil ->
								{
									Dynamic.delete(agg_sync_state, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date} when prev_date <= date ->
								{
									Dynamic.delete(agg_sync_state, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date} when prev_date > date ->
								{
									agg_sync_state,
									agg_writes,
									agg_new_writes,
									max_date
								}
							other ->
								IO.puts "OTHER!!!!!!!!!!!"
								IO.inspect other
								{
									Dynamic.delete(agg_sync_state, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
						end
					other ->
						IO.puts "unrecognized type"
						{agg_sync_state, max_date}
				end
			end)

		# at this point we need to send the new snapshot to all clients that are up to date.

		# each client has sent its "last received data" date.
		# when it connects, we should send all the latest writes that have happened since then, not the full db.
		# get that data for it here.

		relevant = nextWrites
					|> Enum.filter(fn {path_string, %{"date" => path_date, "client_id" => cid }} ->

						old = path_date > last_sync_date and not Map.has_key?(new_writes, path_string)
						new = old and cid != client_id

						old and new
					end)
					|> Enum.into(%{})

		case map_size(new_writes) do
			# 0 -> {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
			0 -> {:reply, confirm_sync_diff(last_date, relevant), {id, nextWrites, nextSyncState}}
			_ ->
				#broadcast(school_id, client_id, snapshot(nextDb))
				broadcast(id, client_id, snapshot_diff(new_writes))
				EdMarkaz.Store.Supplier.save(id, nextSyncState, new_writes)
				# what do we do about attendance?? there are so many paths...
				# {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
				{:reply, confirm_sync_diff(last_date, relevant), {id, nextWrites, nextSyncState}}
		end
	end

	def handle_call({:get_sync_state}, _from, {id, writes, sync_state} = state) do
		{:reply, sync_state, state}
	end

	def handle_call(a, b, c) do
		IO.inspect a
		IO.inspect b
		IO.inspect c

		{:reply, "no match...", c}
	end

	# generates action
	defp snapshot(sync_state) do
		%{
			type: "SNAPSHOT",
			sync_state: sync_state
		}
	end

	defp snapshot_diff(new_writes) do
		%{
			type: "SNAPSHOT_DIFF",
			new_writes: new_writes
		}
	end

	defp confirm_sync_diff(date, new_writes) do
		%{
			type: "CONFIRM_SYNC_DIFF",
			date: date,
			new_writes: new_writes # client should only have to check these against queued / pending writes.
		}
	end

	defp rpc_succeed(new_writes) do
		%{
			type: "RPC_SUCCEED",
			new_writes: new_writes
		}
	end

	defp confirm_sync(date, sync_state) do
		%{
			type: "CONFIRM_SYNC",
			date: date,
			sync_state: sync_state
		}
	end

	defp via(id) do
		{:via, Registry, {EdMarkaz.SupplierRegistry, id}}
	end

	defp broadcast(school_id, sender_id, message) do

		Registry.lookup(EdMarkaz.ConnectionRegistry, school_id)
		|> Enum.filter(fn {pid, client_id}-> client_id != sender_id end)
		|> Enum.map(fn {pid, _} -> send(pid, {:broadcast, message}) end)

	end
end