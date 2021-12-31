import json
import boto3
def lambda_handler(event, context):
    label_map = {6: 'CRIME', 10: 'ENTERTAINMENT', 39: 'WORLD NEWS', 18: 'IMPACT', 24: 'POLITICS', 36: 'WEIRD NEWS', 2: 'BLACK VOICES', 38: 'WOMEN', 5: 'COMEDY', 25: 'QUEER VOICES', 28: 'SPORTS', 3: 'BUSINESS', 34: 'TRAVEL', 20: 'MEDIA', 32: 'TECH', 26: 'RELIGION', 27: 'SCIENCE', 19: 'LATINO VOICES', 9: 'EDUCATION', 4: 'COLLEGE', 23: 'PARENTS', 1: 'ARTS & CULTURE', 29: 'STYLE', 15: 'GREEN', 31: 'TASTE', 16: 'HEALTHY LIVING', 33: 'WORLDPOST', 14: 'GOOD NEWS', 40: 'WORLDPOST', 12: 'FIFTY', 0: 'ARTS', 37: 'WELLNESS', 22: 'PARENTING', 17: 'HOME & LIVING', 30: 'STYLE & BEAUTY', 8: 'DIVORCE', 35: 'WEDDINGS', 13: 'FOOD & DRINK', 21: 'MONEY', 11: 'ENVIRONMENT', 7: 'CULTURE & ARTS'}
    ENDPOINT_NAME = 'blazingtext-2021-12-18-16-54-15-256'
    runtime = boto3.client('runtime.sagemaker')
    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                      ContentType='application/json',
                                      Body=json.dumps(event))
    result = response['Body']
    result = json.loads(result.read().decode("utf-8"))
    predictions = []
    for lab in result[0]['label']:
        predictions.append(label_map[int(lab.split('__')[-1])])
    return {
        'statusCode': 200,
        'body': json.dumps({'labels': predictions})
    }
