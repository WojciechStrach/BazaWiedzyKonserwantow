module.exports = {

    ProductModel: function(){

        this.productName;
        this.productPictureUrl;
        this.productOwner;
        this.productType;
        this.preservatives;
        this.diseases;

        this.setProductName = function(productName){
            this.productName = productName;
        }
        this.getProductName = function(){
            return this.productName;
        }
        //
        this.setProductPictureUrl = function(productPictureUrl){
            this.productPictureUrl = productPictureUrl;
        }
        this.getProductPictureUrl = function(){
            return this.productPictureUrl;
        }
        //
        this.setProductOwner = function(productOwner){
            this.productOwner = productOwner;
        }
        this.getProductOwner = function(){
            return this.productOwner;
        }
        //
        this.setProductType = function(productType){
            this.productType = productType;
        }
        this.getProductType = function(){
            return this.productType;
        }
        //
        this.setPreservatives = function(preservative){
            this.preservatives = preservative;
        }
        this.getPreservatives = function(){
            return this.preservatives;
        }
        //
        this.setDiseases = function(diseases){
            this.diseases = diseases;
        }
        this.getDiseases = function(){
            return this.diseases;
        }
        //
    }    
};