const gulp = require('./gulp')([
    'babel',
    'eslint',
    'watch'
]);

gulp.task('default', [
    'eslint',
    'babel'
]);

// Backwards compatibility
gulp.task('build', ['default']);
