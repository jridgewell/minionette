import gulp from 'gulp';
import karma from 'karma';
import jshint from 'gulp-jshint';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import preprocess from 'gulp-preprocess';
import esformatter from 'gulp-esformatter';
import minimist from 'minimist';

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

gulp.task('build', ['default'], () => {
    return gulp.src(['./src/build/*.js'])
        .pipe(preprocess())
        .pipe(esformatter({ indent: { value: '    ' } }))
        .pipe(gulp.dest('lib'))
        .pipe(uglify())
        .pipe(rename({ suffix: '-min' }))
        .pipe(gulp.dest('lib'));
});

gulp.task('default', ['jshint', 'test']);
