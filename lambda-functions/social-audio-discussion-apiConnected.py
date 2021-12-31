import json
import psycopg2
import boto3
import random
import string
import urllib3


TWILIO_CONFIG = {
    "url": "https://api.twilio.com/2010-04-01/Accounts/AC61dbae656b3ec9bd25bf39632edba3a9/Messages.json",
    "sid": "AC61dbae656b3ec9bd25bf39632edba3a9",
    "pwd": "95e911c1b4ec74c6049aaa2913a9f789",
    "from": "+13202333218"
}

SENDGRID_CONFIG = {
    "url": "https://api.sendgrid.com/v3/mail/send",
    "api-key": "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",
    "from" : "demo.email.2162@gmail.com"
}

def lambda_handler(event, context):
    # TODO implement
    
    if event["resource"] == '/discussion/pending':
    	success, d = getPending(event)
    elif event["resource"] == '/discussion/accepted':
    	success, d = getAccepted(event)
    elif event["resource"] == '/discussion/acceptRequest':
    	success, d = acceptRequest(event)
    elif event["resource"] == '/discussion/requestchat':
        success, d = requestChat(event)
    
    response = {"success": success, "data": d}
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
	
def getPending(event):

    body = json.loads(event["body"])
    user_id = body['user_id']
    discussionStatus = "Requested"
    
    try:
        conn = create_db_connection()
        cur = conn.cursor()
        cur.execute('''
        SELECT Q.question_id, Q.caption,Q.posted_by 
        FROM discussion D INNER JOIN question Q 
        ON D.question = Q.question_id
        WHERE D.answered_by=%s AND D.discussion_status=%s
        ''',(user_id,discussionStatus))
        query_results = cur.fetchall()
        cur.close()
        close_db_connection(conn)
    
    except Exception as e:
        print('Error querying: ',str(e))
        return False, []
    
    responses = []
    for q in query_results:
        res = {
            "question_id" : q[0],
            "caption": q[1],
            "posted_by": q[2]
        }
        responses.append(res)
    
    return True, responses    

def getAccepted(event):
    
    body = json.loads(event["body"])
    user_id = body['user_id']
    
    discussionStatus = "Confirmed"
    
    try:
        conn = create_db_connection()
        cur = conn.cursor()
        cur.execute('''
        SELECT  Q.question_id,Q.caption,Q.posted_by,D.meeting_info,U.phonenumber 
        FROM ((discussion D INNER JOIN question Q 
        ON D.question = Q.question_id) INNER JOIN users U ON Q.posted_by = U.email)
        WHERE D.answered_by=%s AND D.discussion_status=%s
        ''',(user_id,discussionStatus))
        query_results = cur.fetchall()
        cur.close()
        close_db_connection(conn)
        
    except Exception as e:
        print('Exception : ',str(e))
        return False, []
        
    responses = []
    for q in query_results:
        res = {
            "question_id" : q[0],
            "caption": q[1],
            "posted_by": q[2],
            "meeting_info": q[3],
            "phonenumber": q[4]
        }
        responses.append(res)
    
    return True, responses  

def send_email(recv_email,question,answerer_id,meet_link):
    
    msg = "Your request for discussion on question - %s with user %s has been accepted. Please find the meeting link here : %s"% (question,answerer_id,meet_link)
    print('Body of email: ',msg)
    try:
      
        http = urllib3.PoolManager()
        url = SENDGRID_CONFIG['url']
        # headers = urllib3.make_headers(bea='%s' % (SENDGRID_CONFIG["api-key"]))
        headers = {'Authorization': 'Bearer ' + SENDGRID_CONFIG['api-key']}
        headers.update({
            'Content-Type': 'application/json',
        })
        print('Headers: ',headers)
        
        payload = {
            
            "personalizations": [{
                "to": [{"email": str(recv_email)}]}],
                "from": {"email": SENDGRID_CONFIG['from']},
                "subject": "Request for Discussion Approved",
                "content": [{"type": "text/plain", "value": msg}]
        }
            
        
        data = json.dumps(payload)
        response = http.request('POST', url, headers=headers, body=data)
        print('Email sent')
        return True
        
    except Exception as e:
        print('Error sending email, err is : ',str(e))
        return False
    

def send_sms(recv_phone,question,answerer_id,meet_link):
    
    #sending via Twilio for now (SNS requires domain/sandboxing number)
    
    msg = "Your request for discussion on question - %s with user %s has been accepted. Please find the meeting link here : %s "% (question,answerer_id,meet_link)
    
    try:
        http = urllib3.PoolManager()
        url = TWILIO_CONFIG['url']
        headers = urllib3.make_headers(basic_auth='%s:%s' % (TWILIO_CONFIG["sid"], TWILIO_CONFIG["pwd"]))
        headers.update({
            'Content-Type': 'application/x-www-form-urlencoded',
        })
        payload = "Body=%s&To=%s&From=%s" % (msg, recv_phone, TWILIO_CONFIG["from"])
        response = http.request('POST', url, headers=headers, body=payload)
        status = response.status
        data = json.loads(response.data)
        print("Twilio Response: [%s] %s" % (status, data))
        return True
    
    except Exception as e:
        return False
        
    
    
def acceptRequest(event):
   
    body = json.loads(event["body"])
    user_id = body['user_id']
    question_id = body['question_id']
    
    meet_link = "https://meet.google.com/"
    meet_link += ''.join(random.choice(string.ascii_lowercase) for i in range(3)) 
    meet_link+='-'
    meet_link += ''.join(random.choice(string.ascii_lowercase) for i in range(4)) 
    meet_link+='-'
    meet_link += ''.join(random.choice(string.ascii_lowercase) for i in range(3)) 
    discussionStatus = "Confirmed"
    
    try:
        conn = create_db_connection()
        cur = conn.cursor()
        print('Updating DB')
        cur.execute('''
        UPDATE discussion
        SET meeting_info = %s,
            discussion_status = %s
        WHERE question = %s AND answered_by = %s
        ''',(meet_link,discussionStatus,question_id,user_id))
        conn.commit()
        print('Updated table')
        cur.execute('''
        SELECT Q.caption, U.phonenumber,U.email
        FROM question Q INNER JOIN users U ON Q.posted_by = U.email
        WHERE Q.question_id = %s
        ''',(str(question_id),))
        result=cur.fetchall()
        cur.close()
        close_db_connection(conn)
        
        #send_sms(result[0][1],result[0][0],user_id,meet_link) # do using queue later or something (email/sms)
        send_email(result[0][2],result[0][0],user_id,meet_link)
        return True,result
    
    except Exception as e:
        print('Error Updating DB!')
        print('Error : ',str(e))
        return False,[]
        
def requestChat(event):
    body = json.loads(event["body"])
    answer_id = body["answerId"]
    SQS = boto3.client('sqs')
    queue = SQS.get_queue_url(QueueName='pending-requests-sqs').get('QueueUrl')
    response = SQS.send_message(
            QueueUrl = queue,
            MessageBody = "Answer Id",
            MessageAttributes = {
                "Body": {
                    "StringValue" : answer_id,
                    "DataType" : "String"
                }
            }
        ) 
        
    print(response)
    
    return True, []
        
    	
        
    
   
        
    
    
        
        
    
    
