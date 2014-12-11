var gulp = require('gulp');
var karma = require('karma').server;
var jshint = require('gulp-jshint');
var to5 = require('gulp-6to5');


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
    return gulp.src(['./src/*.js'])
        .pipe(to5())
        .pipe(gulp.dest('lib'));
});

gulp.task('default', ['jshint', 'test']);
