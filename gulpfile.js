const fs = require('fs');
const gulp = require('gulp');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const ava = require('gulp-ava');

const transpileTask = () => {
    let babelrc = JSON.parse(fs.readFileSync('.babelrc'));

    return gulp.src('src/*.js.flow')
        .pipe(gulp.dest('.'))
        .pipe(babel(babelrc))
        .pipe(rename({
            extname: ''
        }))
        .pipe(gulp.dest('.'));
};

const lintTask = () => {
    return gulp.src('src/*.js.flow')
        .pipe(eslint())
        .pipe(eslint.format('node_modules/eslint-formatter-pretty'))
        .pipe(eslint.failAfterError());
};

gulp.task('lint', lintTask);
gulp.task('transpile', transpileTask);
gulp.task('build', ['lint'], transpileTask);

gulp.task('test', ['build'], () => {
    return gulp.src('test/*.js')
        .pipe(ava({verbose: true}));
});

gulp.task('watch', ['build'], done => {
    gulp.watch('src/*.js.flow', ['transpile']);
});

gulp.task('default', ['build']);
