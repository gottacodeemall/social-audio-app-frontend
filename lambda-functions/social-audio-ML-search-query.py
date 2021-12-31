import json
import boto3
import requests
from requests_aws4auth import AWS4Auth
import psycopg2


host = 'https://search-metadata-p6w4ipifv6oe7dz4zmqasnrjdu.us-east-1.es.amazonaws.com' # For example, my-test-domain.us-east-1.es.amazonaws.com
region = 'us-east-1'

service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
redundant_word = ['a','the','his','her','hers','they','their','my','me','we','us','theirs','ours','our','him','you','your','yours','it','its','an']
opensearch_endpoint = 'https://search-metadata-p6w4ipifv6oe7dz4zmqasnrjdu.us-east-1.es.amazonaws.com'
headers = { "Content-Type": "application/json" }


def get_url(index, cat, keyword):
	url = opensearch_endpoint + '/' + index + '/' + cat + '/_search?q=hashTags:' + keyword.lower()
	return url


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
	
	

def get_trending_format(questionid):
    conn = create_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('select question_id, caption, posted_by, thumbnail_url  from question where question_id = %s', [questionid])
        trending_question = cur.fetchall()
        conn.commit()
        cur.close()
        close_db_connection(conn)
    except Exception as e:
        response = {"success": False, "error": str(e)}
        return response

    response = {"success": True, "error": ""}
    return trending_question
    
    
# Return a list of k-similarity questions' ID 	
def get_question_for_search_query_knn(search_query):
    ENDPOINT_NAME = 'nlu-search-model'
    runtime = boto3.client('runtime.sagemaker')
    # KNN index maping
    knn_index = {
        "settings": {
            "index.knn": True,
            "index.knn.space_type": "cosinesimil"
        },
        "mappings": {
            "properties": {
                "question_vector": {
                    "type": "knn_vector",
                    "dimension": 768
                }
            }
        }
    }
    path = '/vector_questions'
    url = host + path
    response = requests.put(url, auth=("metadata", "Meta123!"), json=knn_index)
    msg_body = search_query

    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                      ContentType='text/plain',
                                      Body=msg_body)
    result = response['Body']
    embedding = json.loads(result.read().decode("utf-8"))

    endpoint = host + '/vector_questions/_search'
    doc = {'size': 5, 'query': {'knn': {'question_vector': {'vector': embedding, 'k': 5}}}}
    response = requests.get(endpoint, headers=headers, auth=("metadata", "Meta123!"), json=doc)
    response = response.json()
    question_list = []
    for res in response['hits']['hits']:
        result = res['_source']['question_id']
        question_list.append(result)
    return question_list
    
 
def lambda_handler(event, context):
    print("hello:",event)
    res = get_question_for_search_query_knn(event["queryStringParameters"]['query'])
    json_data=[]
    for r in res:
        print(get_trending_format(r))
        q2= get_trending_format(r)
        dict1={}
        dict1['questionId']=q2[0][0]
        dict1['caption']= q2[0][1]
        dict1['postedBy']= q2[0][2]
        dict1['Thumbnail']= q2[0][3]
        json_data.append(dict1)
    
    dict2={}
    dict3= {}
    dict4={}
    response=[]
    
    
    dict2["homePageCategory"]= "Search"
    dict2["questions"]= json_data

    response=dict2['questions']
    return {'isBase64Encoded': False,
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin' : '*'},
        'body': json.dumps(response)}
    # return {
    #     'statusCode': 200,
    #     'body': json.dumps('Success!')
    # }
