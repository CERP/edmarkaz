create table auth
(
	id text unique not null,
	password text not null,
	type text
);

create table tokens
(
	id text not null,
	token text not null,
	client_id text not null
);

create table one_time_tokens
(
	id text not null,
	token text not null,
	sync_time timestamp default current_timestamp
);

create table platform_writes
(
	id text,
	path text
	[],
	value jsonb,
	time bigint,
	type text,
	client_id text,
	sync_time timestamp default current_timestamp
);

	create index on platform_writes
	(id);
	create index on platform_writes
	(time);

	create table suppliers
	(
		id text unique not null,
		sync_state jsonb
	);

	create table consumers
	(
		id text unique not null,
		sync_state jsonb
	);

	create table platform_schools
	(
		id text unique not null,
		db jsonb
	);

	create table products
	(
		id text unique not null,
		supplier_id text not null,
		sync_time timestamp default current_timestamp,
		product jsonb
	);

	create table consumer_analytics
	(
		id text unique not null,
		client_id text not null,
		time bigint not null,
		type text not null,
		meta jsonb not null,
		sync_time timestamp default current_timestamp
	);

	create index on consumer_analytics
	(client_id);

	create table student_portal
	(
		id text unique not null,
		medium text not null,
		class text not null,
		subject text not null,
		chapter_id text not null,
		lesson_id text not null,
		lesson jsonb,
		date timestamp default current_timestamp
	);

	create index on student_portal
	(id);

	create table device_to_school_mapper
	(
		school_id text not null,
		device_id text not null,
		meta jsonb not null,
		time timestamp default current_timestamp
	);

	create table ilmx_to_mis_mapper
	(
		phone text unique not null,
		mis_id text not null,
		ilmx_id text not null,
		time timestamp default current_timestamp
	);

	create table assessments
	(
		id text unique not null,
		medium text not null,
		class text not null,
		subject text not null,
		chapter_id text not null,
		lesson_id text not null,
		meta jsonb,
		questions jsonb,
		date timestamp default current_timestamp
	);

	CREATE TABLE branch_manager
	(
		username text unique not null,
		password text not null,
		branches jsonb not null
	);

	create table targeted_instruction_assessments
	(
		id text unique not null,
		value jsonb not null,
		date timestamp default current_timestamp
	);

	create table targeted_instruction_quizzes
	(
		id text unique not null,
		value jsonb not null,
		date timestamp default current_timestamp
	);


	create table targeted_instruction_curriculum
	(
		id text unique not null,
		value jsonb not null,
		date timestamp default current_timestamp
	);

	create table targeted_instruction_slo_mapping
	(
		id text unique not null,
		value jsonb not null,
		date timestamp default current_timestamp
	);
	create table customer_experience
	(
		phone text not null,
		feedback jsonb,
		date timestamp default current_timestamp
	);

	create table teachers
	(
		id text not null,
		-- id (teacher phone)
		path text not null,
		-- comma separated
		value jsonb not null,
		time bigint not null,
		date timestamp default current_timestamp,
		UNIQUE (id, path)
	);

	create index on teaches
	(teacher_id);

	create table teacher_assessments
	(
		id text unique not null,
		meta jsonb,
		questions jsonb,
		date timestamp default current_timestamp
	);

	create table tp_videos
	(
		id text unique not null,
		meta jsonb,
		date timestamp default current_timestamp
	);
