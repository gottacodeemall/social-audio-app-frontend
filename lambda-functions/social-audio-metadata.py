import json
import boto3
import csv
import datetime
import requests
import random
import psycopg2


# Used to upload data into RDs
def lambda_handler(event, context):
    # read the question metadata files
    key = 'metadata_question_file - Sheet1.csv'
    bucket = 'metadata-question-files'
    s3_resource = boto3.resource('s3')
    s3_object = s3_resource.Object(bucket, key)
    data = s3_object.get()['Body'].read().decode('utf-8').splitlines()
    lines = csv.reader(data)
    headers = next(lines)
    # for line in lines:
    #     save_question(line)


    # read the answer metadata file
    key2 = 'metadata_answer_file - Sheet1.csv'
    bucket2 = 'metadata-answer-files'
    s3_resource2 = boto3.resource('s3')
    s3_object2 = s3_resource2.Object(bucket2, key2)
    data2 = s3_object2.get()['Body'].read().decode('utf-8').splitlines()
    lines2 = csv.reader(data2)
    next(lines2)
    for line in lines2:
        save_answer(line)

    return {
        'statusCode': 200,
        'body': json.dumps('Successfully index question and answer')
    }


def get_question_labels(query):
    lambda_client = boto3.client('lambda')
    msg = {
      "instances": [
        query
        ],
      "configuration": {
        "k": 3
        }
    }
    invoke_response = lambda_client.invoke(FunctionName="social-audio-getlabel",
                                           InvocationType='RequestResponse',
                                           Payload=json.dumps(msg))

    result = json.loads(invoke_response['Payload'].read().decode())
    result = json.loads(result['body'])['labels']
    return result

def convert(s):
    new = ""
    for x in s:
        new += x
        new +=','
    return new
      
def save_question(line):
    # generate random user of the question
    user_list = ['system@columbia.edu', 'sa3979@columbia.edu', 'ln2460@columbia.edu', 'rishavagarwal2717@gmail.com']
    user_id = random.choice(user_list)
    question_id = line[0]
    caption = line[1]
    posted_by = user_id
    hashtags = '#' + line[5]
    location = line[9]
    is_published = True
    question_status = line[8]
    current_time = datetime.datetime.now()
    audio_url='https://ccbd-social-audioapp.s3.amazonaws.com/audio/0f5d822f-db8d-418f-9aaa-f04966293591.m4a'
    categories = get_question_labels(line[1])
    category_string = convert(categories)
        

    conn = create_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO question(question_id,caption,posted_by,hashtags,categories,audio_url,location,is_published,question_status,posted_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
        (question_id, caption, posted_by, hashtags, category_string, audio_url,location, is_published,
         question_status, current_time))
        conn.commit()
        print("succcessully insert into database")
        cur.close()
        close_db_connection(conn)
    except Exception as e:
        response = {"success": False, "error": str(e)}
        return response

    response = {"success": True, "error": ""}
    return response


def save_answer(line):
    # create the s3 url of answer
    answer_url = "https://acme-answers.s3.amazonaws.com/" + line[0]
    # generate radom user for the answer
    user_list = ['system@columbia.edu', 'sa3979@columbia.edu', 'ln2460@columbia.edu', 'rishavagarwal2717@gmail.com']
    user_id = random.choice(user_list)

    answer_id = line[0]
    question = line[3]
    audio_url = answer_url
    answered_by = user_id
    answered_at = datetime.datetime.now()
    #print(answer_id, question, audio_url, answered_by, answered_at)

    conn = create_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO answer(answer_id,question,audio_url,answered_by,answered_at) VALUES (%s,%s,%s,%s,%s)',(answer_id,question,audio_url,answered_by,answered_at))
        conn.commit()
        cur.close()
        close_db_connection(conn)
    except Exception as e:
        response = {"success": False, "error": str(e)}
        print(response)
        return response

    response = {"success": True, "error": ""}
    print(response)
    return response



# connect to RDs database
def create_db_connection():
	ENDPOINT="social-audio-app-provisioned.cwiyyeh7e2xn.us-east-1.rds.amazonaws.com"
	PORT="5432"
	USR="postgres"
	REGION="us-east-1"
	DBNAME="postgres"

	#gets the credentials from .aws/credentials
	client = boto3.client('rds')

	try:
		conn = psycopg2.connect(host=ENDPOINT, port=PORT, database=DBNAME, user=USR, password='sunrisesinthewest')
		return conn
	except Exception as e:
		print("Database connection failed due to {}".format(e))

def close_db_connection(conn):
	conn.close()



