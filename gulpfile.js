var gulp = require('gulp'),
  path = require('path'),
  webpack = require('gulp-webpack'),
  rename = require('gulp-rename'), //更改名字
  uglify = require('gulp-uglify'), //js代码压缩
  sass = require('gulp-sass'),
  notify = require('gulp-notify'), //通知信息
  autoprefixer = require('gulp-autoprefixer'),
  clean = require('gulp-clean-css'), //css代码压缩
  spriter = require('gulp-css-spriter'),
  base64 = require('gulp-css-base64'),
  fileinclude = require('gulp-file-include');

gulp.task('sass', function() {
  return gulp.src('./src/sass/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'last 3 Safari versions'],
      cascade: true,
      remove: true
    }))
    .pipe(clean())
    .pipe(gulp.dest('./src/css'));
  // .pipe(notify("<%= file.relative %> 成功生成!"));
});

gulp.task('sass:watch', function() {
  gulp.watch('./src/sass/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'sass:watch']);
