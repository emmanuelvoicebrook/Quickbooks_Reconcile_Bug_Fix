import { LightningElement, wire, api, track } from "lwc";
import {
  getPicklistValues,
  getPicklistValuesByRecordType,
} from "lightning/uiObjectInfoApi";
import getArticles from "@salesforce/apex/TreeArticleViewController.getArticles";
import getArticle from "@salesforce/apex/TreeArticleViewController.getArticle";
import getArticleById from "@salesforce/apex/TreeArticleViewController.getArticleById";
import { CurrentPageReference } from "lightning/navigation";
// import KNOWLEDGE_KAV from "@salesforce/schema/Knowledge__kav";
import { NavigationMixin } from "lightning/navigation";
import { publish } from "lightning/messageService";
import { getRecord } from "lightning/uiRecordApi";
import USER_ID from "@salesforce/user/Id";
import USERPROFILE_ID from "@salesforce/schema/User.ProfileId";
const MAIN_FIELD = "Collection__c";
const SUB_FIELD = "Collection_Category__c";

export default class TreeArticleView extends NavigationMixin(LightningElement) {
  @track categories = [];
  @track category_types = {};
  @track active_article = "";
  @track article_title = "";
  @track all_articles = [];
  @track active_article_content = "";
  @track active_article_name = "";
  @track active_article_collection = "";
  @track active_article_collection_category = "";
  @track active_article_urlname = "";
  @track do_not_show_menu_on_community = false;
  @track do_not_show_menu_on_publickb = false;
  @track loading = true;
  @track title_not_chosen = false;
  @track expand_navigation = false;
  @api internal = false;
  @api recordId;
  @api location;
  @api titleSize;
  @api menuWidth;
  @api maxWidth;
  @api contentMaxWidth;
  // sObject = KNOWLEDGE_KAV;

  urlName = null;

  currentUserProfileId;
  error;
  @wire(getRecord, { recordId: USER_ID, fields: [USERPROFILE_ID] })
  userDetails({ error, data }) {
    if (data) {
      this.currentUserProfileId = data.fields.ProfileId.value;
      console.log("user profile id: " + this.currentUserProfileId);
    } else if (error) {
      this.error = error;
      console.log("Profile Id Error: " + this.error);
    }
  }

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.urlName = currentPageReference.attributes.urlName;
    }
    console.log(currentPageReference);
    console.log("State Parameters");
    console.log(this.urlName);
  }

  setParametersBasedOnUrl() {
    this.urlId = this.urlStateParameters.id || null;
    this.urlLanguage = this.urlStateParameters.lang || null;
    this.urlType = this.urlStateParameters.type || "10";
  }
  connectedCallback() {
    if (this.active_article_name && this.all_articles.length > 0) {
      ("use strict");
      this.active_article_content = this.all_articles
        .filter((article) => {
          return article.Title == this.active_article_name;
        })
        .map((article) => {
          return article.Article__c;
        })
        .join("");
    }
  }

  renderedCallback() {
    console.log("rendered");
    if (!this.loading && !this.title_not_chosen) return;
    if (this.internal) {
      // get the article by Id if oppened in record view
      getArticleById({ Id: this.recordId })
        .then((result) => {
          console.log(result);
          this.active_article_name = result.Title;
          this.article_title = result.Title;
          this.active_article_collection = result.Collection__c;
          this.active_article_collection_category =
            result.Collection_Category__c;
          this.active_article_urlname = result.UrlName;
          this.do_not_show_menu_on_community =
            result.Do_Not_Show_Collection_On_Community__c;
          this.do_not_show_menu_on_publickb =
            result.Do_Not_Show_Collection_On_Public_KB__c;
          this.expand_navigation = result.Expand_Navigation__c;
          console.log("UrlName: " + this.active_article_urlname);
          if (result.Article__c) {
            console.log("Using Article Field");
            this.active_article_content = result.Article__c;
          } else if (result.Step_by_Step__c) {
            console.log("Using Step by Step Field");
            this.active_article_content = result.Step_by_Step__c;
          } else if (result.Summary__c) {
            console.log("Using Summary Field");
            this.active_article_content = result.Summary__c;
          }
          this.loading = false;
          this.title_not_chosen = false;
          if (this.has_category_types) {
            try {
              this.template.querySelector(
                "lightning-accordion"
              ).activeSectionName = this.active_article_collection_category;
            } catch (err) {
              console.log(err);
            }
          }
          // console.log("Open Accordion: "+ this.template.querySelector("lightning-accordion").activeSectionName);
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
          this.title_not_chosen = true;
        });
    } else {
      // get the article by urlName if oppened in community
      getArticle({ UrlName: this.urlName })
        .then((result) => {
          console.log(result);
          this.active_article_name = result.Title;
          this.article_title = result.Title;
          this.active_article_collection = result.Collection__c;
          this.active_article_collection_category =
            result.Collection_Category__c;
          this.do_not_show_menu_on_community =
            result.Do_Not_Show_Collection_On_Community__c;
          this.do_not_show_menu_on_publickb =
            result.Do_Not_Show_Collection_On_Public_KB__c;
          this.active_article_urlname = result.UrlName;
          this.expand_navigation = result.Expand_Navigation__c;
          console.log("UrlName: " + this.active_article_urlname);
          if (result.Article__c) {
            console.log("Using Article Field");
            this.active_article_content = result.Article__c;
          } else if (result.Step_by_Step__c) {
            console.log("Using Step by Step Field");
            this.active_article_content = result.Step_by_Step__c;
          } else if (result.Summary__c) {
            console.log("Using Summary Field");
            this.active_article_content = result.Summary__c;
          }
          this.loading = false;
          this.title_not_chosen = false;
          if (this.has_category_types) {
            try {
              this.template.querySelector(
                "lightning-accordion"
              ).activeSectionName = this.active_article_collection_category;
            } catch (err) {
              console.log(err);
            }
          }
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
          this.title_not_chosen = true;
        });
    }
  }

  init() {
    if (this.internal) {
      getArticleById({ Id: this.recordId })
        .then((result) => {
          this.handleArticle(result);
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
          this.title_not_chosen = true;
        });
    } else {
      getArticle({ UrlName: this.urlName })
        .then((result) => {
          this.handleArticle(result);
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
          this.title_not_chosen = true;
        });
    }
  }

  handleArticle(result) {
    this.active_article_name = result.Title;
    this.article_title = result.Title;
    this.active_article_collection = result.Collection__c;
    this.active_article_collection_category = result.Collection_Category__c;
    this.active_article_urlname = result.UrlName;
    this.expand_navigation = result.Expand_Navigation__c;
    console.log("UrlName: " + this.active_article_urlname);
    if (result.Article__c) {
      console.log("Using Article Field");
      this.active_article_content = result.Article__c;
    } else if (result.Step_by_Step__c) {
      console.log("Using Step by Step Field");
      this.active_article_content = result.Step_by_Step__c;
    } else if (result.Summary__c) {
      console.log("Using Summary Field");
      this.active_article_content = result.Summary__c;
    }
    this.loading = false;
    this.title_not_chosen = false;
    if (this.has_category_types) {
      try {
        this.template.querySelector("lightning-accordion").activeSectionName =
          this.active_article_collection_category;
      } catch (err) {
        console.log(err);
      }
    }
  }
  objectApiName = "Knowledge__kav";
  recordTypeId = "012000000000000AAA";
  @wire(getPicklistValuesByRecordType, {
    objectApiName: "$objectApiName",
    recordTypeId: "$recordTypeId",
  })
  picklistValues({ data, error }) {
    if (data) {
      // create a list of objects with the main picklistValues as the key and the sub picklistValues as the values
      // let main_options = [];
      // let depended_options = [];
      var sub_options = [];

      let main_options = data.picklistFieldValues[MAIN_FIELD].values;
      let dependancy_data =
        data.picklistFieldValues[SUB_FIELD].controllerValues;
      let all_dependent_options = data.picklistFieldValues[SUB_FIELD].values;
      getArticles()
        .then((result) => {
          this.all_articles = result;
          main_options.forEach((main_option) => {
            let key = dependancy_data[main_option.value];
            let opt_for_main = all_dependent_options.filter((opt) =>
              opt.validFor.includes(key)
            );
            let option_values = [];
            opt_for_main.forEach((opt) => {
              let obj = {};
              obj.label = opt.label;
              obj.titles = [];
              this.all_articles.forEach((article) => {
                if (article.Collection_Category__c == opt.label) {
                  obj.titles.push({
                    label: article.Navigation_Title__c
                      ? article.Navigation_Title__c
                      : article.Title,
                    value: article.UrlName,
                    id: article.Id,
                    selected: false,
                  });
                }
              });
              option_values.push(obj);
            });
            sub_options[main_option.label] = option_values;

            // sub_options.push(obj);
          });
          this.categories = main_options;
          // only get the sub options with data inside

          this.category_types = sub_options;
          
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (error) {
      console.log("Error Retrieving Fields", error);
    }
  }

  handleNewTitle(event) {
    // find the article that matches the urlName
    let article = event.detail;
    this[NavigationMixin.Navigate]({
      type: "standard__knowledgeArticlePage",
      attributes: {
        articleType: "MyArticleType",
        urlName: article,
      },
    });
  }
  handleInternalTitle(event) {
    // remove the current active_article_urlname from the event.detail
    let art = event.detail;

    // find the article that matches the urlName from all articles
    let new_article = this.all_articles.filter(
      (article) => article.UrlName == art
    );
    //
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: new_article[0].Id,
        objectApiName: "Knowledge__kav",
        actionName: "view",
      },
    });

    publish;

    this.renderedCallback();
  }

  get get_category_types() {;
    // loop over all category type keys and return only the values that have titles array
    let return_obj = [];
    let keys = Object.keys(this.category_types);
    let options = [];
    let obj = {};
    keys.forEach((key) => {
      let values = this.category_types[key];
      let new_values = [];
      values.forEach((value) => {
        if (value.titles.length > 0) {
          let new_obj = {};
          new_obj.label = value.label;
          new_obj.titles = value.titles;
          new_values.push(new_obj);
        }
      })
      obj[key] = new_values;
           
    });
    console.log("Options: ");
    console.log(JSON.parse(JSON.stringify(obj)))

    // return { ...this.category_types };
    return obj;
  }

  get has_category_types() {
    if (this.active_article_collection_category) {
      return true;
    } else {
      return false;
    }
  }

  get show_accordions() {
    // check if it is internaly placed
    try {
      if (this.internal) {
        console.log("Internal");
        if (this.active_article_collection_category) {
          return true;
        } else {
          return false;
        }
      } else {
        console.log("Not Internal");
        console.log("Location: " + this.location);
        if (this.location.toLowerCase() == "community") {
          if (this.do_not_show_menu_on_community) {
            console.log("Do not show menu on community");
            return false;
          } else {
            if (this.active_article_collection_category) {
              console.log("Do not show menu on community");
              return true;
            } else {
              console.log("Do not show menu on community");
              return false;
            }
          }
        } else if (this.location.toLowerCase() == "public") {
          if (this.do_not_show_menu_on_public) {
            console.log("Do not show menu on public");
            return false;
          } else {
            if (this.active_article_collection_category) {
              console.log("Show menu on public");
              return true;
            } else {
              console.log("Do not show menu on public");
              return false;
            }
          }
        } else if (this.location.toLowerCase() == "internal") {
          if (this.active_article_collection_category) {
            return true;
          } else {
            return false;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  get getTitleStyle() {
    let style = "color:#4073a5;"
    if (this.titleSize) {
      style += "font-size:" + this.titleSize + "px;!important";
    } 
    
    return style;
  }

  get getMenuWidth() {
    let style = "border-right: 1px solid #f4f4f4;"
    if (this.menuWidth) {
      style += "width:" + this.menuWidth ;
    } else {
      style += "width:20%;";
    }

    if(this.maxWidth){      
      style += "max-width:" + this.maxWidth;
    } else {
      style += "max-width:20%;";
    }
    return style;
  }

  get navigationStyle() {
    let style = "padding:0 30px;";

    if(this.contentMaxWidth){
      style += "max-width:" + this.contentMaxWidth ;
    }

    return style;
  }
}