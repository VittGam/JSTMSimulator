# JSTMSimulator

A Turing Machine simulator written in JavaScript. It should work on Chrome and Firefox, as well as IE 6 through 10. Testing by the developer is usually done on Firefox and IE 6.

This simulator has been written from scratch and it's based on the design and functionality of the Java simulator developed by Antonio Cisternino (http://mdt.di.unipi.it/TMSimulatore/TMSimulator-1.2.zip).

For the machine syntax, I'm going to write it in the wiki. In the meantime, please refer to the documentation contained in the zip file of the original Java version (in Italian).

## Online Version

You can find it on https://www.turingsimulator.net/.

## How to compile

To get the sources you need to have Git installed on your computer.

```
git clone git://github.com/VittGam/JSTMSimulator.git
```

All the commands from now on should be run from the project root.

```
cd JSTMSimulator
```

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

You can now configure the server by copying the skeleton configuration from `server/config.sample.js` to `server/config.js`, and adding users, problems and testcases as needed.

To start the contest server run:

```
node server/server.js
```

The contest server listens by default on `0.0.0.0:8081`.

To generate the contest result pages run:

```
node server/build_results.js
```

You'll find them in `server/results/GENERATION_TIMESTAMP`.

You can use the `sqlite3` utility directly on the database to edit user-submitted data, if needed.

```
sqlite3 server/database.sqlite
```

## TODO

- htaccess and htpasswd generation in server/build_results.js

Any suggestion? Please create an issue or a pull request, or drop me a line at `vittgam {at} turingsimulator {dot} net`. Thanks!

## License

The MIT license. Please see the `LICENSE` file for more details.
