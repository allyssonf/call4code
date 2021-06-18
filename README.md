# Call 4 Code Repository

## Machine Learning Sample

Access _**machinelearning**_ folder. There you have JupyterNotebook file to run the experiment on Watson Studio.

## Watson Assistant Sample React App

This application integrates 3 IBM Watson services:

1. Watson Assistant
2. Watson Speech-To-Text
3. Watson Text-To-Speech

You need to create such services on your [IBM Cloud](cloud.ibm.com) account.

`skill` folder has a sample of a Pizza bot with the following features:

* Slot
* Slot Handlers
* Webhook call

You can import this skill into your Watson Assistant service instance and create an Assistant based on this skill.

For Watson Assistant you'll need to create a Skill to connect to the application.

Access _**watsonassistant**_ folder.

To run the project, follow these steps:

* Install project dependencies:
> yarn install
* Create a `.env` file that needs the following `key=value`(s):
```
# STT SERVICE
WA_STT_KEY=<API_KEY>
WA_STT_URL=<SERVICE_URL>

# TTS SERVICE
WA_TTS_KEY=<API_KEY>
WA_TTS_URL=<SERVICE_URL>

# WATSON ASSISTANT
WA_ID=<ASSISTANT_ID>
WA_KEY=<API_KEY>
WA_URL=<SERVICE_URL>
```
* To run the project, first, start backend on a shell:
> yarn start:back

* And then, start frontend on another shell:
> yarn start:front
