# Comparison of Physics Engines

(compared to an ideal engine)

Feature                        | Newton           | Box2d            | Chipmunk         | etc
-------------------------------|------------------|------------------|------------------|-----
Traditional rigid bodies       |:x:               |:white_check_mark:|:white_check_mark:|
Deformable soft bodies         |:white_check_mark:|:x:               |:x:               |
Fast                           |:white_check_mark:|:white_check_mark:|:white_check_mark:|
Stable                         |:x:               |:white_check_mark:|:white_check_mark:|
Idiomatic JavaScript           |:white_check_mark:|:x:               |:x:               |
Simple API                     |:white_check_mark:|:x:               |:x:               |
Garbage-collector friendly     |:white_check_mark:|:x:               |:x:               |
Fixed-step, replayable         |:white_check_mark:|:question:        |:question:        |
Decoupled from rendering       |:white_check_mark:|:white_check_mark:|:white_check_mark:|
Runs in web worker             |:white_check_mark:|:x:               |:x:               |
Runs in node.js                |:white_check_mark:|:x:               |:x:               |
Solid documentation            |:x:               |:white_check_mark:|:white_check_mark:|
Available via package managers |:white_check_mark:|:x:               |:x:               |
Simple collision filtering     |:white_check_mark:|:x:               |:x:               |
Bullet collisions              |:x:               |:white_check_mark:|:white_check_mark:|
Extensible body definitions    |:white_check_mark:|:white_check_mark:|:white_check_mark:|
Realistic collision response   |:x:               |:white_check_mark:|:white_check_mark:|
Realistic friction             |:x:               |:white_check_mark:|:white_check_mark:|
Arbitrarily-shaped bodies      |:x:               |:white_check_mark:|:white_check_mark:|
Forces as persistent objects   |:white_check_mark:|:question:        |:question:        |
