create table auth (
	id text unique not null,
	password text not null
);

create table tokens (
	id text not null,
	token text not null,
	client_id text not null
);

create table platform_writes (
	id text,
	path text[],
	value jsonb,
	time bigint,
	type text,
	client_id text,
	sync_time timestamp default current_timestamp
);

create index on platform_writes(id);
create index on platform_writes(time);

create table suppliers (
	id text unique not null,
	sync_state jsonb
);

create table platform_schools (
	id text unique not null,
	db jsonb 
);

create table products (
	id text unique not null,
	supplier_id text unique not null,
	sync_time timestamp default current_timestamp,
	product jsonb
);