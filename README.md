# JSTMSimulator

A Turing Machine simulator written in JavaScript. It should work on Chrome and Firefox, as well as IE 6 through 10. Testing by the developer is usually done on Chrome and IE 6.

This simulator has been written from scratch and it's based on the design and functionality of the Java simulator developed by Antonio Cisternino (http://mdt.di.unipi.it/TMSimulatore/TMSimulator-1.2.zip).

For the machine syntax, I'm going to write it in the wiki. In the meantime, please refer to the documentation contained in the zip file of the original Java version (in Italian).

## Online Version

You can find it on http://www.turingsimulator.net/.

## How to compile

To get the sources you need to have Git installed on your computer.

```
git clone git://github.com/VittGam/JSTMSimulator.git
cd JSTMSimulator
```

All the commands from now on should be run from the project root.

You'll need NodeJS (I'm using v0.10.26) with the following modules:

```
npm install uglifycss uglify-js
```

To compile the simulator just run:

```
node build_simulator.js
```

You'll find the compiled simulator in `out/jstmsimulator.htm`.

## The contest server

You can use this to run a Turing Machine Competition. The simulator and the evaluation use the same engine (and share the same bugs :P .)

All the commands should be run from the project root (not from the `server` subdirectory.)

To run the contest server you need to get the JSON3 submodule:
```
git submodule init
git submodule update
```

Then you'll also need to install the following NodeJS modules:

```
npm install async express@3.5.1 sanitizer sqlite3
```

(The server isn't compatible with express 4.x for now.)

After you've done with the prerequisites, first create the database by editing and running the file:

```
node server/init_contest_database.sample.js
```

To start the contest server run:

```
node server/server.js
```

To start the admin server run:

```
node server/admin.js
```

You can configure the servers parameters in `server/config.js`.
The contest server listens by default on `0.0.0.0:8081`, and the admin server on `0.0.0.0:8082`.
The admin server default credentials are `admin:admin`.

To generate the contest result pages run:

```
node server/build_results.js
```

You'll find them in `server/results/GENERATION_TIMESTAMP`.

You can use the `sqlite3` utility directly on the database, until a proper admin interface is implemented. :P

```
sqlite3 server/database.sqlite
```

## TODO

- Contest admin interface interactivity (to add problems, users and testcases on-the-fly)
- htaccess and htpasswd generation in server/build_results.js

Any suggestion? Please create an issue or a pull request, or drop me a line at `vittgam {at} turingsimulator {dot} net`. Thanks!

## License

The MIT license. Please see the `LICENSE` file for more details.
