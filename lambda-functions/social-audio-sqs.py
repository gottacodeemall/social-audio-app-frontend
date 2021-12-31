import json
import boto3
import psycopg2
import requests
    
ENDPOINT_NAME = 'nlu-search-model'
runtime = boto3.client('runtime.sagemaker') 


def convert(s):
    new = ""
    for x in s:
        new += x
        new +=','
    return new

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
		
    
def upload_embedding(questionId, questionContent):
    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                      ContentType='text/plain',
                                      Body=questionContent)
    result = response['Body']
    embedding = json.loads(result.read().decode("utf-8"))
    
    doc = {"question_vector": embedding, "question": questionContent, "question_id":questionId}
    endpoint = 'https://search-metadata-p6w4ipifv6oe7dz4zmqasnrjdu.us-east-1.es.amazonaws.com/vector_questions/_doc'
    response = requests.post(endpoint, auth=("metadata", "Meta123!"), json=doc)
    print(response.text)
    
    
def upload_category(questionId, questionContent):
    lambda_client = boto3.client('lambda')
    msg = {
      "instances": [
        questionContent
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
    result = convert(result)
    conn = create_db_connection()
    cur = conn.cursor()
    cur.execute('UPDATE question SET categories=%s WHERE question_id=%s', (result, questionId))
    conn.commit()
    cur.close()
    conn.close() 
    print(result)
    


def lambda_handler(event, context):
    # TODO implement
    print(event)
    questionId = event['Records'][0]['messageAttributes']['QuestionId']['stringValue']
    print(questionId)
    conn = create_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT caption FROM question WHERE question_id = %s", (questionId, ))
    questionContent = cur.fetchall()[0][0]
    conn.commit()
    cur.close()
    conn.close() 
    upload_embedding(questionId, questionContent)
    upload_category(questionId, questionContent)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
