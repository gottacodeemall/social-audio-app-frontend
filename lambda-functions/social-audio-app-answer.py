import json
import psycopg2
import boto3
import datetime

def lambda_handler(event, context):
	#answer(event)
	if event["httpMethod"] == 'GET':
		response = answer(event)
	elif event["httpMethod"] == 'POST':
		response = save_answer(event)
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

def answer(event):
	answer = []
	print(event)
	question_id = event["queryStringParameters"]['questionId']
	#question_id = '8'
	conn = create_db_connection() 
	cur = conn.cursor()
	cur.execute('SELECT * FROM Answer WHERE question=%s', (question_id,))
	query_results = cur.fetchall()
	# query_results = [('1', '8', 'sampleurl', 'test1@columbia.edu', 'datetime.datetime(2021, 12, 4, 17, 12, 6, 503954)'),('1', '8', 'sampleurl', 'test1@columbia.edu', 'datetime.datetime(2021, 12, 4, 17, 12, 6, 503954)')]
	# print(query_results)
	# print(query_results[0][0])
	for i in range(len(query_results)):
		dict1 = {}
		answer_id = query_results[i][0]
		question = query_results[i][1]
		audio_url = query_results[i][2]
		answered_by = query_results[i][3]
		answered_by = str(answered_by)
		dict1['answerId']= answer_id
		dict1['question'] = question
		dict1['audio'] = audio_url
		dict1['answeredBy'] = answered_by
		answer.append(dict1)
	# print(answer)
	return(answer)

def save_answer(event):
	body = json.loads(event["body"])
	answer_id = body["answerId"]
	question = body["question"]
	audio_url = body["audio"]
	answered_by = body["answeredBy"]
	answered_at = datetime.datetime.now()

	# client = boto3.client('s3')

	# audio_url = client.put_object(Body=audio,Key='question_id',Bucket='social-audio-app-question-audio')

	# thumbnail_url = ""

	conn = create_db_connection()
	try:
		cur = conn.cursor()
		cur.execute('INSERT INTO answer(answer_id,question,audio_url,answered_by,answered_at) VALUES (%s,%s,%s,%s,%s)',(answer_id,question,audio_url,answered_by,answered_at))
		conn.commit()
		cur.close()
		close_db_connection(conn)
	except Exception as e:
		response = {"success": False, "error": str(e)}
		return response

	response = {"success": True, "error": ""}
	return response


