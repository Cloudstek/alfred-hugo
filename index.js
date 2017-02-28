'use strict';import Conf from'conf';import CacheConf from'cache-conf';const ICON_ROOT='/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/';/**
 * Hugo
 */class Hugo{/**
     * Hugo constructor
     * @constructor
     *//**
     * Cache
     * @see https://www.npmjs.com/package/cache-conf
     * @type {CacheConf}
     *//**
     * Output buffer
     * @type {Object}
     */constructor(){this.outputBuffer={};this.config=new Conf({cwd:Hugo.workflowMeta.data});this.cache=new CacheConf({configName:'cache',cwd:Hugo.workflowMeta.cache,version:Hugo.workflowMeta.version});}/**
     * Alfred metadata
     * @return {Object}
     *//**
     * Configuration
     * @see https://www.npmjs.com/package/conf
     * @type {Conf}
     *//**
     * Refresh (rerun) interval in seconds
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {number|null}
     */static get alfredMeta(){return{version:process.env.alfred_version,theme:process.env.alfred_theme,themeBackground:process.env.alfred_theme_background,themeSelectionBackground:process.env.alfred_theme_selection_background,themeSubtext:parseFloat(process.env.alfred_theme_subtext),preferences:process.env.alfred_preferences,preferencesLocalHash:process.env.alfred_preferences_localhash};}/**
     * Workflow metadata
     * @return {Object}
     */static get workflowMeta(){return{name:process.env.alfred_workflow_name,version:process.env.alfred_workflow_version,uid:process.env.alfred_workflow_uid,bundleId:process.env.alfred_workflow_bundleid,data:process.env.alfred_workflow_data,cache:process.env.alfred_workflow_cache};}/**
     * Add item to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {void}
     */addItem(item){if(!this.outputBuffer.items){this.outputBuffer.items=[];}if(item.arg&&typeof item.arg==='object'){let arg=item.arg.arg;let variables=item.arg.variables;item.arg=JSON.stringify({alfredworkflow:{arg:arg,variables:variables}});}this.outputBuffer.items.push(item);}/**
     * Add items to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {void}
     */addItems(items){if(!this.outputBuffer.items){this.outputBuffer.items=[];}items.map(item=>{this.addItem(item);return item;});}/**
     * Add session variable to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {void}
     */addVariable(key,value){if(!this.outputBuffer.variables){this.outputBuffer.variables={};}this.outputBuffer.variables[key]=value;}/**
     * Add session variables to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json/
     * @type {void}
     */addVariables(variables){if(!this.outputBuffer.variables){this.outputBuffer.variables=variables;return;}this.outputBuffer.variables=Object.assign({},this.outputBuffer.variables,variables);}/**
     * Get the full path to a built-in macOS icon
     * @type {string}
     */macIcon(name){return ICON_ROOT+name+'.icns';}/**
     * Run a callback when first script argument matches keyword. Callback will have third argument as query parameter.
     * @example node index.js myaction "my query"
     * @type {void}
     */action(keyword,callback){let query=process.argv[2];if(query&&query===keyword){let query=process.argv[3]||'';callback(query);}}/**
     * Flush the output buffer so Alfred shows our items
     * @type {void}
     */feedback(){if(this.rerun){this.outputBuffer.rerun=this.rerun;}// Output JSON
console.log(JSON.stringify(this.outputBuffer,null,'\t'));// Reset output buffer
this.outputBuffer={};}}module.exports=new Hugo();