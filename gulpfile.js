var gulp = require('gulp');
var path = require('path');
var webpack = require('gulp-webpack');
var rename = require('gulp-rename'); //更改名字
var uglify = require('gulp-uglify'); //js代码压缩
var sass = require('gulp-sass');
var notify = require('gulp-notify'); //通知信息
var autoprefixer = require('gulp-autoprefixer');
var html2jade = require('gulp-html2jade');

gulp.task('sass', function() {
  return gulp.src('./src/sass/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'last 3 Safari versions'],
      cascade: true,
      remove: true
    }))
    .pipe(gulp.dest('./src/css'));
});

gulp.task('sass:watch', function() {
  gulp.watch('./src/sass/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'sass:watch']);
