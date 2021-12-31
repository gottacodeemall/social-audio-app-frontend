

import psycopg2
import sys
import boto3
import os
import json
from math import sqrt
import heapq
import requests
import datetime



def create_db_connection():
    ENDPOINT="social-audio-app-provisioned.cwiyyeh7e2xn.us-east-1.rds.amazonaws.com"
    PORT="5432"
    USR="postgres"
    REGION="us-east-1"
    DBNAME="postgres"
    client = boto3.client('rds')
    try:
	    conn=psycopg2.connect(host=ENDPOINT, port=PORT, database=DBNAME, user=USR, password='sunrisesinthewest')
	    return conn
    except Exception as e:
	    print("Database connection failed due to {}".format(e))
	    
def close_db_connection(conn):
	conn.close() 
	

opensearch_endpoint = 'https://search-metadata-p6w4ipifv6oe7dz4zmqasnrjdu.us-east-1.es.amazonaws.com'
headers = { "Content-Type": "application/json" }
VIEW_WEIGHT=2
GRAVITY=0.2 

def get_url(index, cat):
	url = opensearch_endpoint + '/' + index + '/' + cat + '/_search?q= _type:Question&size=200'
	return url
	
def respond(res):
    return {
        'statusCode': '200', 
        'body': json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
        },
    }


def zscore(obs, pop):
    # Size of population.
    number = float(len(pop))
    # Average population value.
    avg = sum(pop) / number
    # Standard deviation of population.
    std = sqrt(sum(((c - avg) ** 2) for c in pop) / number)
    # Zscore Calculation.
    return (obs - avg) / std
    
def cal_ranking(q):
    view_times = q['viewTimes']
    posted_time = datetime.datetime.strptime(q['postedTime'], "%y-%m-%d %H:%M:%S")
    current_time = datetime.datetime.now()
    hours_since_posted = ((current_time - posted_time).seconds)/3600
    rank = (view_times*VIEW_WEIGHT)/(hours_since_posted*GRAVITY)
    return rank
    
def get_trending_question():
    # get most recent 1 month data from db. then turn it to a list
    # questions = 'SELECT * FROM Question WHERE date DATEADD(m, -1, GETDATE()) and GETDATE()'
    url = get_url('questions', 'Question')
    es_response = requests.get(url, auth=("metadata", "Meta123!"), headers=headers)
    es_src = json.loads(es_response.text)['hits']['hits']
    questions = []
    for result in es_src:
        questions.append(result['_source'])
    print(questions)
    
    # get top k trending questions 
    top_list = []
    k = 10 # get top 10 trending
    for q in questions:
        ranking = cal_ranking(q)
        q['ranking']=ranking
        top_list.append(q)
    new_list = sorted(top_list, key=lambda x:x['ranking'],reverse=True)
    print(new_list[:10])
    return new_list[:10]
    
    
def get_trending_question_navie():
    conn = create_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('select question_id from question order by posted_at desc limit 10')
        trending_question = cur.fetchall()
        conn.commit()
        cur.close()
        close_db_connection(conn)
    except Exception as e:
        response = {"success": False, "error": str(e)}
        return response

    response = {"success": True, "error": ""}
    return trending_question

def get_data():
    conn = create_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM question')
    #print(cur.fetchall())
    query_results = cur.fetchall()
    #print(query_results)
    cur.close()
    close_db_connection(conn)
    return query_results
    #cur = conn.cursor()
    
def get_latest_data():
    conn = create_db_connection()
    cur = conn.cursor()
    cur.execute('select * from question order by posted_at desc limit 10')
    #print(cur.fetchall())
    query_results = cur.fetchall()
    #print(query_results)
    cur.close()
    close_db_connection(conn)
    return query_results
    #cur = conn.cursor()

def get_location_based_on_question():
    conn = create_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('select question_id, caption, posted_by, thumbnail_url from question where location= %s limit 10', ["NY"]) 
        trending_question = cur.fetchall()
        conn.commit()
        cur.close()
        close_db_connection(conn)
    except Exception as e:
        response = {"success": False, "error": str(e)}
        return response

    response = {"success": True, "error": ""}
    return trending_question
    
def get_trending_format(questionid):
    conn = create_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('select question_id, caption, posted_by, thumbnail_url from question where question_id = %s', [questionid])
        trending_question = cur.fetchall()
        conn.commit()
        cur.close()
        close_db_connection(conn)
    except Exception as e:
        response = {"success": False, "error": str(e)}
        return response

    response = {"success": True, "error": ""}
    return trending_question
    
def lambda_handler(event, context): 
    #event["resource"] = '/relevantquestionsforhomepage'
    #response = ""
    #if event["resource"] == '/relevantquestionsforhomepage':
    print(event)
    q = get_data()
    json_data=[]
    num = len(q)
    num1= len(q)//3
    c=0
    print(num)
    
    res = get_trending_question()
    for x in res:
        q2 = get_trending_format(x['questionId'])
        c=c+1
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
    
    
    dict2["homePageCategory"]= "Trending"
    dict2["questions"]= json_data
    #homepage_format.append(dict2)
    #print(homepage_format)
    response.append(dict2)
    
    
    
    
    
    q1= get_latest_data()
    #Latest
    json_data=[]
    for i in range(0,len(q1)):
        dict1={}
        dict1['questionId']=q1[i][0]
        dict1['caption']= q1[i][1]
        dict1['postedBy']= q1[i][2]
        dict1['Thumbnail']= q1[i][7]
        json_data.append(dict1)
    '''for i in range(3*num1,num):
        dict1={}
        dict1['questionId']=q[i][0]
        dict1['caption']= q[i][1]
        dict1['postedBy']= q[i][2]
        dict1['Thumbnail']= q[i][7]
        json_data.append(dict1)'''
    dict4["homePageCategory"]= "Latest"
    dict4["questions"]= json_data
    response.append(dict4)
    
    
    q3= get_location_based_on_question()
    #Location
    json_data=[]
    for i in range(0,len(q3)):
        dict1={}
        dict1['questionId']=q3[i][0]
        dict1['caption']= q3[i][1]
        dict1['postedBy']= q3[i][2]
        dict1['Thumbnail']= q3[i][3]
        json_data.append(dict1)
    dict3["homePageCategory"]= "Location"
    dict3["questions"]= json_data
    response.append(dict3)
    
    return response
