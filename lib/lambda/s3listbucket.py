import os
import boto3

def handler(event, context):
    # Get the S3 bucket name from the environment variable
    bucket_name = os.environ.get("BUCKET_NAME")

    if not bucket_name:
        return {
            "statusCode": 400,
            "body": "S3_BUCKET_NAME environment variable is not set."
        }

    # Initialize the S3 client
    s3_client = boto3.client('s3')

    try:
        # List objects in the specified S3 bucket
        response = s3_client.list_objects_v2(Bucket=bucket_name)

        # Extract object keys from the response
        object_keys = [obj["Key"] for obj in response.get("Contents", [])]

        # Return the list of object keys
        return {
            "statusCode": 200,
            "body": object_keys
        }
    except Exception as e:
        # Handle errors here
        return {
            "statusCode": 500,
            "body": f"Error listing objects in bucket {bucket_name}: {str(e)}"
        }
