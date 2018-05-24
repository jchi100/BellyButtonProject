# import necessary libraries
#import numpy as np

import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
#from sqlalchemy import create_engine, func, desc,select


#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################


engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata= Base.classes.samples_metadata

# Create our session (link) from Python to the DB
session = Session(engine)
# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/names')
def names():
        new_name_list = []
        name_list = session.execute("SELECT sampleid FROM Samples_metadata").fetchall()
        
        for name in name_list:
            new_name_list.append('BB_'+ str(name).strip("()").split(",")[0])
               
        return jsonify(new_name_list)
    
@app.route('/otu')
def otu():

        tmp = session.execute("SELECT lowest_taxonomic_unit_found FROM Otu").fetchall()
        otu_list = [str(x).strip('\'(,)\'') for x in tmp]
               
        return jsonify(otu_list)

@app.route('/metadata/<sample>')
def get_metadata(sample):
    input_sample = sample[3:]
    sel = [Samples_metadata.AGE,Samples_metadata.BBTYPE,Samples_metadata.ETHNICITY, Samples_metadata.GENDER,
           Samples_metadata.LOCATION, Samples_metadata.SAMPLEID]

    result = session.query(*sel).\
        filter(Samples_metadata.SAMPLEID == input_sample).one()

    metadata = {}
    
    metadata['age'] = result[0]
    metadata['bbtype'] = result[1]
    metadata['ethnicity'] = result[2]
    metadata['gender'] = result[3]
    metadata['location'] = result[4]
    metadata['sampleid'] = result[5]

    return jsonify(metadata)

@app.route('/wfreq/<sample>')
def get_wfreq(sample):
    
    input_sample = sample[3:]
    sel = [Samples_metadata.WFREQ]

    result = session.query(*sel).\
        filter(Samples_metadata.SAMPLEID == input_sample).all()

    wfreq = int(str(result[0]).strip('(,)'))

    return jsonify(wfreq)

@app.route('/samples/<sample>')
def sort_samples(sample):
    
    query_str = 'select * from Samples inner join Otu on Samples.otu_id = Otu.otu_id'

    df = pd.read_sql(query_str, engine)
    df = df.sort_values(by=sample, ascending=0)
    df = df.head(10)
    data = {
        "otu_ids": df[sample].index.values.tolist(),
        "sample_values": df[sample].values.tolist(),
        "otu_label": df['lowest_taxonomic_unit_found'].values.tolist()
        
    };
    
    return jsonify(data)

if __name__ == "__main__":
    app.run()