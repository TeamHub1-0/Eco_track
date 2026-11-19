Project EcoTrack {
database_type: 'MySQL'
Note: 'Database design for the EcoTrack waste reporting system'
}

// ENUMS

Enum waste_category {
PLASTIC
PAPER
GLASS
METAL
CARDBOARD
BIOLOGICAL
}

Enum report_status {
PENDING
APPROVED
RESOLVED
REJECTED
}

Enum location_source {
GPS
MANUAL
}

// USERS
Table users {
id bigint [pk, increment]
name varchar(100) [not null]
email varchar(255) [not null]
password varchar(255) [not null, unique]

profile_picture varchar(500) [null, note: 'Path to the user profile picture']

created_at timestamp [default: `CURRENT_TIMESTAMP`]
updated_at timestamp
}

// GARBAGE REPORTS

Table garbage_reports {
id bigint [pk, increment]

user_id bigint [not null]
category waste_category [not null]

title varchar(255) [not null]
description text

location "POINT" [not null, note: 'MySQL POINT SRID 4326. X = longitude, Y = latitude.']

location_source location_source [not null, note: 'GPS or manually selected on map']
location_accuracy float [note: 'Optional GPS accuracy in meters']

status report_status [not null, default: 'PENDING']

created_at timestamp [default: `CURRENT_TIMESTAMP`]
updated_at timestamp

indexes {
user_id
(status, created_at)
}

Note: 'Create a MySQL SPATIAL INDEX on location separately. DBML does not define the MySQL R-tree spatial index.'
}

// REPORT IMAGES

Table report_images {
id bigint [pk, increment]
report_id bigint [not null]

image_path varchar(500) [not null]

created_at timestamp [default: `CURRENT_TIMESTAMP`]

indexes {
report_id
}
}

// REPORT HISTORY

Table report_history {
id bigint [pk, increment]
report_id bigint [not null]

changed_by bigint
old_status report_status
new_status report_status [not null]

note text

created_at timestamp [default: `CURRENT_TIMESTAMP`]

indexes {
report_id
changed_by
}
}

// RELATIONSHIPS

Ref: garbage_reports.user_id > users.id
Ref: report_images.report_id > garbage_reports.id

Ref: report_history.report_id > garbage_reports.id
Ref: report_history.changed_by > users.id
