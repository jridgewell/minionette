import gulp from 'gulp';
import karma from 'karma';
import jshint from 'gulp-jshint';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import preprocess from 'gulp-preprocess';
import esformatter from 'gulp-esformatter';
import minimist from 'minimist';
import esperanto from 'esperanto';
import file from 'gulp-file';
import filter from 'gulp-filter';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';

const opts = minimist(process.argv.slice(2));

gulp.task('test', done => {
    karma.server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: !opts.continuous
    }, done);
});

gulp.task('jshint', () => {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default', {verbose: true}))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build', done => {
    esperanto.bundle({
        base: 'src',
        entry: 'minionette.js'
    }).then(bundle => {
        var res = bundle.toUmd({
            sourceMap: 'inline',
            name: 'Minionette'
        });

        file('minionette', res.code, { src: true })
            .pipe(plumber())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(babel())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('lib'))
            .pipe(filter(['*', '!**/*.js.map']))
            .pipe(rename({ suffix: '-min' }))
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('lib'))
            .on('end', done);
    }).catch(done);
});

// gulp.task('default', ['jshint', 'test']);
