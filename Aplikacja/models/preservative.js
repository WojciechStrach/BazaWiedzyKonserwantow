module.exports = {

    PreservativeModel: function(){

        this.preservativeSign;
        this.preservativeCommonName;
        this.preservativeDescribe;
        this.preservativeType;
        this.preservativeDiseases;
        this.preservativeProducts;

        this.setPreservativeDescribe = function(preservativeDescribe){
            this.preservativeDescribe = preservativeDescribe;
        }
        this.getPreservativeDescribe = function(){
            return this.preservativeDescribe;
        }
        //
        this.setPreservativeSign = function(preservativeSign){
            this.preservativeSign = preservativeSign;
        }
        this.getPreservativeSign = function(){
            return this.preservativeSign;
        }
        //
        this.setPreservativeCommonName = function(preservativeCommonName){
            this.preservativeCommonName = preservativeCommonName;
        }
        this.getPreservativeCommonName = function(){
            return this.preservativeCommonName;
        }
        //
        this.setPreservativeType = function(preservativeType){
            this.preservativeType = preservativeType;
        }
        this.getPresservativeType = function(){
            return this.preservativeType;
        }
        //
        this.setPreservativeDiseases = function(preservativeDiseases){
            this.preservativeDiseases = preservativeDiseases;
        }
        this.getPreservativeDiseases = function(){
            return this.preservativeDiseases;
        }
        //
        this.setPreservativeProducts = function(preservativeProducts){
            this.preservativeProducts = preservativeProducts;
        }
        this.getPreservativeProducts = function(){
            return this.preservativeProducts;
        }
        // 
    }
};