import json
import boto3
import psycopg2
import uuid

SQS_QUEUE_NAME = "pending-requests-sqs"


def poll_sqs_messages():
   
    # Poll the SQS messages
    sqs_client = boto3.client('sqs')
    sqs_queue_url = sqs_client.get_queue_url(QueueName=SQS_QUEUE_NAME)['QueueUrl']
    
    print("SQS name: %s - url: %s" % (SQS_QUEUE_NAME, sqs_queue_url))
    try:
        response = sqs_client.receive_message(
            QueueUrl=sqs_queue_url,
            MaxNumberOfMessages=10,
            MessageAttributeNames=['All'],
            VisibilityTimeout=30
        )
        print("SQS Response: %s" % response)

        messages = response['Messages'] if 'Messages' in response else []
        for message in messages:
            receipt_handle = message['ReceiptHandle']
            # Delete received message from queue
            response = sqs_client.delete_message(
                QueueUrl=sqs_queue_url,
                ReceiptHandle=receipt_handle
            )
            print("SQS Delete Response: %s" % response)

        print("SQS deleted %s msgs" % len(messages)) 
        parsed = []
        for msg in messages:
            body = msg['MessageAttributes']['Body']['StringValue']
            parsed.append(body)
        print("SQS parsed msgs: %s" % parsed)
        return parsed
    except Exception as e:
        print("Error: %s" % str(e))
        return []

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
        
def query_from_db(answer_ids):
    
    
    conn = create_db_connection()
    cur = conn.cursor()
    discussions = []
    
    print('Querying DB')
    
    for aid in answer_ids:
        d_obj = {}
        try:
            ans_id = str(aid)
            cur.execute('''SELECT question, answered_by FROM answer WHERE answer_id=%s''',(ans_id,))
            query_results = cur.fetchall()
            # posted_by= cur.execute('SELECT posted_by FROM question WHERE question_id=%s',(qid))
            d_obj['discussion_id'] = str(uuid.uuid4())
            d_obj['question'] = query_results[0][0]
            d_obj['answer'] = ans_id
            #d_obj['posted_by'] = posted_by
            d_obj['answered_by'] = query_results[0][1]
            discussions.append(d_obj)
        except Exception as e:
            print('Error getting data from DB')
            print('Error : ',str(e))
            continue
    
    close_db_connection(conn)
    return discussions
    
            
def add_to_db(discussions):
    
    conn = create_db_connection()
    cur = conn.cursor()
    
    status = "Requested"
    
    for d_obj in discussions:
        try:
            cur.execute('INSERT INTO discussion(discussion_status,discussion_id,answer,answered_by,meeting_info,question) VALUES (%s,%s,%s,%s,%s,%s)',(status,d_obj['discussion_id'],d_obj['answer'],d_obj['answered_by'],None,d_obj['question']))
            conn.commit()
            cur.close()
        except Exception as e:
    	    print('Error inserting into DB!')
    	    print('Error : ',str(e))
    	
    
    close_db_connection(conn)
    return 

def lambda_handler(event, context):
    # TODO implement
    
    # 1. Poll the answer ids from the queue
    # 2. Query respective question id, answered_by
    # 3. Create Discussion Obj with all the details and add to DB
    
    
    answer_ids = poll_sqs_messages()
    print('Answer ids are : ',answer_ids)
    discussions = query_from_db(answer_ids)
    print('To add to discussions : ',discussions)
    add_to_db(discussions)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
