tweec.it
========

you're beautiful. your images should be too. 

backend todo
============
* process a credit card with stripe
* get image directory names using imagemagik
* upload images to S3
* write a cron job that checks for images in "finished" directories, emails them to the correct user, & then marks them as sent in redis

frontend todo
=============
* base layout
* login box (modal)
* redirecting to smugmug properly
* render image thumbnails from array of URLs
* highlight selected images
* add/remove images to user record as they are selected/de-selected
* add modal to select tweecs and add/remove tweecs from image records
* checkout modal that shows images, tweecs, total cost, & allows edits
* setup stripe form
* thank you page
* about us page