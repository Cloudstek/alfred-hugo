const fs = require('fs');
const gulp = require('gulp');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const ava = require('gulp-ava');

/**
 * Transpile using babel
 */
const transpileTask = () => {
    let babelrc = JSON.parse(fs.readFileSync('.babelrc'));

    return gulp.src('*.js.flow')
        .pipe(babel(babelrc))
        .pipe(rename({
            extname: ''
        }))
        .pipe(gulp.dest('.'));
};

/**
 * Lint using eslint (and babel)
 */
const lintTask = () => {
    return gulp.src('*.js.flow')
        .pipe(eslint())
        .pipe(eslint.format('node_modules/eslint-formatter-pretty'))
        .pipe(eslint.failAfterError());
};

/**
 * Run tests using ava
 */
const testTask = () => {
    return gulp.src('test/*.js')
        .pipe(ava({verbose: true}));
};

gulp.task('lint', lintTask);
gulp.task('transpile', transpileTask);
gulp.task('build', ['lint'], transpileTask);
gulp.task('test', ['build'], testTask);

gulp.task('watch', ['build'], done => {
    gulp.watch('src/*.js.flow', ['transpile']);
});

gulp.task('default', ['build']);
