import json
import psycopg2
import boto3
import hashlib

def lambda_handler(event, context):
    # TODO implement
    if event["resource"] == '/signup':
    	success, error = signup(event)
    elif event["resource"] == '/login':
    	success, error = login(event)
    elif event["resource"] == '/editprofile':
    	success, error = update(event)
    response = {"success": success, "error": error}
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

def login(event):
	email = event["queryStringParameters"]['email'].lower()
	password = hashlib.md5((event["queryStringParameters"]['password']).encode("utf-8")).hexdigest()

	conn = create_db_connection()
	cur = conn.cursor()
	cur.execute('SELECT * FROM users WHERE email=%s and password=%s',(email,password))
	if not len(cur.fetchall()):
		cur.close()
		close_db_connection(conn)
		return False, "Invalid User"
	else:
		cur.close()
		close_db_connection(conn)
		return True, ""

def signup(event):
	body = json.loads(event["body"])
	email = body["email"].lower()
	password = hashlib.md5((body["password"]).encode("utf-8")).hexdigest()
	first_name = body["firstName"]
	last_name = body["lastName"]
	age = body["age"]
	gender = body["sex"]
	ethnicity = body["ethnicity"]
	intro = body["intro"]
	phone = body["phoneNumber"]

	conn = create_db_connection()
	try:
		cur = conn.cursor()
		cur.execute('INSERT INTO users(email,password,first_name,last_name,age,sex,ethnicity,intro,phonenumber) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',(email,password,first_name,last_name,age,gender,ethnicity,intro,phone))
		conn.commit()
		cur.close()
		close_db_connection(conn)
	except Exception as e:
		return False, str(e)
	
	return True, ""

def update(event):
	body = json.loads(event["body"])
	email = body["email"]
	password = body["password"]
	first_name = body["firstName"]
	last_name = body["lastName"]
	age = body["age"]
	gender = body["sex"]
	ethnicity = body["ethnicity"]
	intro = body["intro"]
	phone = body["phoneNumber"]

	conn = create_db_connection()
	try:
		cur = conn.cursor()
		cur.execute("UPDATE users SET password = %s,first_name = %s,last_name = %s,age = %s,sex = %s,ethnicity = %s,intro = %s,phonenumber = %s WHERE email = %s",(password,first_name,last_name,age,gender,ethnicity,intro,phone,email))
		conn.commit()
		cur.close()
		close_db_connection(conn)
	except Exception as e:
		return False, str(e)
	
	return True, ""
