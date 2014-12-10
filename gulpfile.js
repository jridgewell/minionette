var gulp = require('gulp');
var karma = require('karma').server;
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var preprocess = require('gulp-preprocess');
var esformatter = require('gulp-esformatter');


gulp.task('test', function (done) {
    karma.start({
        configFile: 'karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('continuous', function (done) {
    karma.start({
        configFile: 'karma.conf.js'
    }, done);
});

gulp.task('jshint', function() {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default', {verbose: true}))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build', ['default'], function() {
    return gulp.src(['./src/build/*.js'])
        .pipe(preprocess())
        .pipe(esformatter({ indent: { value: '    ' } }))
        .pipe(gulp.dest('lib'))
        .pipe(uglify())
        .pipe(rename({ suffix: '-min' }))
        .pipe(gulp.dest('lib'));
});

gulp.task('default', ['jshint', 'test']);
