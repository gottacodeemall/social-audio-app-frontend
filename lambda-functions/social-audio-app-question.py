import json
import psycopg2
import boto3
import datetime

def lambda_handler(event, context):
	if event["httpMethod"] == 'GET' and 'questionId' in event["queryStringParameters"]:
		response = question(event)
	elif event["httpMethod"] == 'GET' and 'email' in event["queryStringParameters"]:
		response = questions_for_user(event)
	elif event["httpMethod"] == 'POST':
		response = save_question(event)
	return {
		'isBase64Encoded': False,
		'statusCode': 200,
		'headers': {'Access-Control-Allow-Origin' : '*'},
		'body': json.dumps(response)
	}

def create_db_connection():
	ENDPOINT="social-audio-app-provisioned.cwiyyeh7e2xn.us-east-1.rds.amazonaws.com"
	PORT="5432"
	USR="postgres"
	REGION="us-east-1"
	DBNAME="postgres"

	#gets the credentials from .aws/credentials
	# session = boto3.Session(profile_name='RDSCreds')
	client = boto3.client('rds')

	# token = client.generate_db_auth_token(DBHostname=ENDPOINT, Port=PORT, DBUsername=USR, Region=REGION) 

	try:
		conn = psycopg2.connect(host=ENDPOINT, port=PORT, database=DBNAME, user=USR, password='sunrisesinthewest')
		return conn
	except Exception as e:
		print("Database connection failed due to {}".format(e))


def close_db_connection(conn):
	conn.close() 

def question(event):
	dict1 ={}
	print("Helooooooo",event)
	question_id = event["queryStringParameters"]['questionId']
	conn = create_db_connection()
	cur = conn.cursor()
	cur.execute('SELECT * FROM Question WHERE question_id=%s', (question_id,))
	query_results = cur.fetchall()
	print(query_results)
	question_id = query_results[0][0]
	caption = query_results[0][1]
	postedBy = query_results[0][2]
	hashtags = query_results[0][3]
	categories = query_results[0][4]
	taggedUsers = query_results[0][5]
	audio = query_results[0][6]
	Thumbnail = query_results[0][7]
	location = query_results[0][8]
	isPublished = query_results[0][9]
	questionStatus = query_results[0][10]
	dict1['questionId']= question_id
	dict1['caption'] = caption
	dict1['postedBy'] = postedBy
	dict1['hashtags'] = hashtags
	dict1['categories'] = categories
	dict1['taggedUsers'] = taggedUsers
	dict1['audio'] = audio
	dict1['Thumbnail'] = Thumbnail
	dict1['location'] = location
	dict1['isPublished'] = isPublished
	dict1['questionStatus'] = questionStatus
	return dict1
	
	
def save_question(event):
	body = json.loads(event["body"])
	question_id = body["questionId"]
	caption = body["caption"]
	posted_by = body["postedBy"]
	hashtags = body["hashtags"]
	categories = body["categories"]
	tagged_users = body["taggedUsers"]
	audio = body["audio"]
	thumbnail = body["Thumbnail"]
	location = body["location"]
	is_published = body["isPublished"]
	question_status = body["questionStatus"]
	current_time = datetime.datetime.now()

	conn = create_db_connection()
	try:
		cur = conn.cursor()
		cur.execute('INSERT INTO question(question_id,caption,posted_by,hashtags,categories,tagged_users,audio_url,thumbnail_url,location,is_published,question_status,posted_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',(question_id,caption,posted_by,hashtags,categories,tagged_users,audio,thumbnail,location,is_published,question_status,current_time))
		conn.commit()
		cur.close()
		close_db_connection(conn)
		SQS = boto3.client('sqs')
		queue = SQS.get_queue_url(QueueName='questions-for-processing').get('QueueUrl')
		response = SQS.send_message(
            QueueUrl = queue,
            MessageBody = "Question Id",
            MessageAttributes = {
                "QuestionId": {
                    "StringValue" : question_id,
                    "DataType" : "String"
                }
            }
        )
	except Exception as e:
		response = {"success": False, "error": str(e)}
		return response

	response = {"success": True, "error": ""}
	return response
	
def questions_for_user(event):
	questions = []
	print(event)
	email = str(event["queryStringParameters"]['email']).lower()
	status = event["queryStringParameters"]['status']
	conn = create_db_connection()
	cur = conn.cursor()
	print(email)
	if status == 'draft':
		cur.execute('SELECT * FROM question WHERE posted_by=%s AND is_published = false', (email,))
	elif status == 'posted':
		cur.execute('SELECT * FROM question WHERE posted_by=%s AND is_published = true', (email,))
	elif status == 'answered':
		cur.execute('SELECT * FROM question WHERE question_id IN (SELECT question FROM answer WHERE answered_by = %s)', (email,))
	query_results = cur.fetchall()
	for i in range(len(query_results)):
		dict1 = {}
		question_id = query_results[i][0]
		caption = query_results[i][1]
		postedBy = query_results[i][2]
		hashtags = query_results[i][3]
		categories = query_results[i][4]
		taggedUsers = query_results[i][5]
		audio = query_results[i][6]
		Thumbnail = query_results[i][7]
		location = query_results[i][8]
		isPublished = query_results[i][9]
		questionStatus = query_results[i][10]
		dict1['questionId']= question_id
		dict1['caption'] = caption
		dict1['postedBy'] = postedBy
		dict1['hashtags'] = hashtags
		dict1['categories'] = categories
		dict1['taggedUsers'] = taggedUsers
		dict1['audio'] = audio
		dict1['Thumbnail'] = Thumbnail
		dict1['location'] = location
		dict1['isPublished'] = isPublished
		dict1['questionStatus'] = questionStatus
		questions.append(dict1)
	# print(answer)
	return(questions)
