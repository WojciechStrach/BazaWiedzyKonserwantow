module.exports = {

    DiseaseModel: function(){

        this.diseaseName;
        this.diseasePreservatives;

        //
        this.setDiseaseName = function(diseaseName){
            this.diseaseName = diseaseName;
        }
        this.getDiseaseName = function(){
            return this.diseaseName;
        }
        //
        this.setDiseasePreservatives = function(diseasePreservatives){
            this.diseasePreservatives = diseasePreservatives;
        }
        this.getDiseasePreservatives = function(){
            return this.diseasePreservatives;
        }
    }

};