#!/bin/bash

copy_s3_bucket_to_directory() {
  local bucket_name=$1
  local target_directory=$2

  echo "Copying files from S3 bucket ${bucket_name} to ${target_directory}..."

  # Use awslocal to copy files from the specified bucket to the target directory
  awslocal s3 cp s3://${bucket_name} ${target_directory} --recursive

  echo "Files copied successfully from ${bucket_name} to ${target_directory}."
}

# Call the function for each bucket-directory pair
copy_s3_bucket_to_directory "aoe" "/host-directory/aoe"
copy_s3_bucket_to_directory "aoepdf" "/host-directory/aoepdf"
copy_s3_bucket_to_directory "aoethumbnail" "/host-directory/aoethumbnail"
