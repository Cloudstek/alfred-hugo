const fs = require('fs');
const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('eslint', function () {
    return gulp.src(['./**/*.js.flow', './tests/*.js', '!node_modules', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format('node_modules/eslint-formatter-pretty'))
        .pipe(eslint.failAfterError());
});

gulp.task('babel', function () {
    let babelrc = JSON.parse(fs.readFileSync('.babelrc', 'utf8') || '{}');

    return gulp.src(['./**/*.js.flow', '!node_modules', '!node_modules/**'])
        .pipe(sourcemaps.init())
        .pipe(babel(babelrc))
        .pipe(rename(path => {
            // Fix file extension for double ext files (.js.flow)
            path.extname = path.basename.endsWith('.js') ? '' : '.js';
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
    gulp.watch(['./**/*.js.flow', '!node_modules', '!node_modules/**'], gulp.series('babel'));
});

gulp.task('default', gulp.series(
    'eslint',
    'babel'
));

// // Backwards compatibility
gulp.task('build', gulp.series('default'));
