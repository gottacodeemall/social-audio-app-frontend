import json
import psycopg2
import boto3

 
def create_db_connection():
	ENDPOINT="social-audio-app-provisioned.cwiyyeh7e2xn.us-east-1.rds.amazonaws.com"
	PORT="5432"
	USR="postgres"
	REGION="us-east-1"
	DBNAME="postgres"
	client = boto3.client('rds')

	try:
		conn = psycopg2.connect(host=ENDPOINT, port=PORT, database=DBNAME, user=USR, password='sunrisesinthewest')
		return conn
	except Exception as e:
		print("Database connection failed due to {}".format(e))


def close_db_connection(conn):
	conn.close() 
	
	
def get_question_for_user(user_email):
    conn = create_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("select SPLIT_PART(preferences, ',', 1)preferences from users where email=%s", (user_email,))
        #print(cur.fetchall())
        user_prefer = cur.fetchall()[0][0]
        user_prefer +='%'
        print(user_prefer)
        cur.execute("select question_id, caption, posted_by, thumbnail_url from question where categories ilike %s order by posted_at desc limit 10", (user_prefer,))
        user_questions = cur.fetchall()
        #for qid in cur.fetchall():
        #    user_questions.append(qid[0])
        print("user question is", user_questions)
        conn.commit()
        cur.close()
        close_db_connection(conn)
    except Exception as e:
        response = {"success": False, "error": str(e)}
        return response

    response = {"success": True, "error": ""}
    return user_questions

def lambda_handler(event, context):
    print("Hello", event)
    email = event['queryStringParameters']['email']
    res = get_question_for_user(email) 
    json_data=[]
    for x in res:
        dict1={}
        dict1={}
        dict1['questionId']=x[0]
        dict1['caption']= x[1]
        dict1['postedBy']= x[2]
        dict1['Thumbnail']= x[3]
        json_data.append(dict1)
    response=[]
    dict2={}
    dict2["homePageCategory"]= "ForYou"
    dict2["questions"]= json_data
    #homepage_format.append(dict2)
    #print(homepage_format)
    response.append(dict2)
    #print(response)
    #return response
    return {'isBase64Encoded': False,
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin' : '*'},
        'body': json.dumps(response)}
        #response
