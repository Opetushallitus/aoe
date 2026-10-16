#!/bin/sh

awslocal s3 mb s3://aoe
awslocal s3 mb s3://aoepdf
awslocal s3 mb s3://aoethumbnail
awslocal s3 mb s3://aoe-uploaded-materials

echo "S3 bucket 'aoe' created."

UPLOAD_DIR="/host-directory"

if [ -d "$UPLOAD_DIR" ] && [ "$(ls -A "$UPLOAD_DIR")" ]; then
    echo "Uploading files from $UPLOAD_DIR to corresponding S3 buckets..."

    for subfolder in "$UPLOAD_DIR"/*; do
        if [ -d "$subfolder" ]; then
            bucket_name=$(basename "$subfolder")
            echo "Processing folder '$subfolder' for S3 bucket '$bucket_name'..."

            if [ "$(ls -A "$subfolder")" ]; then
                awslocal s3 cp "$subfolder" "s3://$bucket_name/" --recursive --exclude ".*" --exclude "*/.*"
            else
                echo "No files to upload in folder '$subfolder'."
            fi
        fi
    done
else
    echo "No files or folders to upload in $UPLOAD_DIR."
fi