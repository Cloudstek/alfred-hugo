const gulp = require('./gulp')([
    'babel',
    'eslint',
    'watch',
    'watch'
]);

gulp.task('build', [
    'babel',
    'eslint',
]);

gulp.task('default', [
    'watch',
    'build'
]);
