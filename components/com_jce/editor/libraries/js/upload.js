(function($){$.widget("ui.uploader",{uploader:{},errors:0,uploading:false,options:{field:$('input[name=file]:first'),size:false,limit:5,debug:false,filter:null,swf:'uploader.swf',xap:'uploader.xap',runtimes:'html5,flash,silverlight,html4',chunk_size:0,urlstream_upload:true,insert:true,buttons:{},required:['multipart']},FILE_SIZE_ERROR:-600,FILE_EXTENSION_ERROR:-601,FILE_INVALID_ERROR:-800,_init:function(){var self=this;this.field=this.options.field;this.files=[];this.current=null;$(this.field).remove();this._createUploader()},_createSimple:function(){$.extend(this.options,{runtimes:'html4',required:['multipart']});if(this.uploader){this.uploader.destroy()}this._createUploader()},_createUploader:function(){var self=this;var options=this.options,filters=[];if($.isPlainObject(options.filter)){$.each(options.filter,function(k,v){filters.push({title:k,extensions:v.replace(/\*\./g,'').replace(/;/,',')})})}var size=this.options.size;if(!/kb/.test(size)){size=parseFloat(size)+'kb'}var container=$('#upload-browse').parent().attr('id');if(!container){container='upload_buttons_container';$('#upload-browse').parent().attr('id',container)}try{this.uploader=new plupload.Uploader({container:container,runtimes:options.runtimes,unique_names:false,browse_button:'upload-browse',browse_button_hover:'ui-state-hover',browse_button_active:'ui-state-active',drop_element:'upload-queue-block',max_file_size:size,url:options.url,flash_swf_url:options.swf,silverlight_xap_url:options.xap,filters:filters,chunk_size:options.chunk_size,multipart:true,required_features:self.options.required.join(','),rename:true});this.uploader.bind('Init',function(up){self._createDragDrop();up.features.canOpenDialog=false});this.uploader.bind('PostInit',function(up){});this.uploader.bind('Refresh',function(up){});this.uploader.bind('QueueChanged',function(){var files=self.uploader.files;$('#upload-queue-drag, #upload-queue-queue').css('display','none');self._createQueue(files)});this.uploader.bind('UploadFile',function(up,file){self._onStart(file)});this.uploader.bind('StateChanged',function(up){if(up.state==plupload.STOPPED){self._onAllComplete()}});this.uploader.bind('FileUploaded',function(up,file,o){var status='';switch(file.status){case plupload.DONE:status='complete';break;case plupload.FAILED:status='error';self.errors++;break}if(o.response===''){if(o.status===200){o.response='{"error":false,"files":["'+file.name+'"]}'}else{o.response='{"error":true,"text":"UPLOAD ERROR"}'}}self._onComplete(file,$.parseJSON(o.response),status)});this.uploader.bind('Error',function(up,err){var file=err.file,message,details;if(err.code===plupload.INIT_ERROR){self._createSimple()}if(file){var msg=err.message.replace(/[^a-z ]/gi,'').replace(/\s+/g,'_').toLowerCase();details=$.Plugin.translate(err.code,err.code);message='<p><strong>'+$.Plugin.translate(msg,err.message)+'</strong></p>';if(err.details){message+='<p>'+err.details+'</p>'}else{switch(err.code){case self.FILE_EXTENSION_ERROR:case self.FILE_INVALID_ERROR:details=details.replace('%s',file.name);break;case self.FILE_SIZE_ERROR:details=details.replace(/%([fsm])/g,function($0,$1){switch($1){case'f':return file.name;case's':return plupload.formatSize(file.size);case'm':return plupload.formatSize(up.settings.max_file_size)}});break}message+='<p>'+details+'</p>'}$.Dialog.alert(message)}});this.uploader.bind('FilesRemoved',function(files){});this.uploader.bind("UploadProgress",function(o,file){self._onProgress(file)});if(this.uploader.settings.chunk_size){this.uploader.bind('ChunkUploaded',function(file,o){window.setTimeout(function(){},1000)})}this.uploader.init()}catch(e){alert(e)}},_getUploader:function(){return this.uploader},_onStart:function(file){var el=file.element;$(el).addClass('load');$('span.queue-item-rename, span.queue-item-insert','#upload-queue').addClass('disabled');if(this.uploader.runtime!='html4'){$('span.queue-item-progress',el).show()}},_isError:function(err){if(err){if($.isArray(err)){return err.length}return true}return false},_onComplete:function(file,response,status){$(file.element).removeClass('load');if(this._isError(response.error)){status='error';this.errors++;if($.isArray(response.text)){response.text=response.text.join(' : ')}$(file.element).addClass('error').after('<li class="queue-item-error"><span>'+response.text+'</span></li>');$('span.queue-item-progress',file.element).hide()}else{$(file.element).addClass(status);if(file.status==plupload.DONE){if(response.files&&response.files.length){file.name=response.files[0]}var item={name:plupload.cleanName(file.name),insert:$('span.queue-item-insert',file.element).hasClass('selected')};this._trigger('fileComplete',null,item)}}$('span.queue-item-status',file.element).addClass(status)},_onAllComplete:function(){this.uploading=false;this._trigger('uploadComplete')},_setProgress:function(el,percent){$('span.queue-item-progress',el).css('width',percent+'%')},_onProgress:function(file){$('span.queue-item-size',file.element).html(plupload.formatSize(file.loaded));var percent=file.percent;if(file.size==file.loaded){percent=100}$('span.queue-item-size',file.element).html(percent+'%');this._setProgress(file.element,percent)},upload:function(args){var files=this.uploader.files;if(files.length){this.uploading=true;this.uploader.settings.resize=args.resize;this.uploader.settings.multipart_params=args||{};this.uploader.start()}return false},refresh:function(){if(!this.uploading)this.uploader.refresh()},close:function(){if(this.uploading)this.uploader.stop();this.uploader.destroy()},getErrors:function(){return this.errors},isUploading:function(){return this.uploading},_createDragDrop:function(){if(this.uploader.features.dragdrop){$('<li id="upload-queue-drag">'+$.Plugin.translate('upload_drop','Drop files here')+'</li>').appendTo('ul#upload-queue').show('slow')}else{$('<li id="upload-queue-queue">'+$.Plugin.translate('upload_queue','Upload Queue')+'</li>').appendTo('ul#upload-queue').show('slow')}},_renameFile:function(file,name){this.uploader.getFile(file.id).name=name;this._trigger('fileRename',null,file)},_removeFiles:function(){this.uploader.splice();$(this.element).html('<li style="display:none;"></li>');this._createDragDrop()},_removeFile:function(file){this._trigger('fileDelete',null,file);$(file.element).remove();this.uploader.removeFile(file)},_createQueue:function(files){var self=this,doc=document,max_file_size=this.uploader.settings.max_file_size,input,info;$(this.element).empty();$.each(files,function(x,file){if(/\.(php|php(3|4|5)|phtml|pl|py|jsp|asp|htm|shtml|sh|cgi)/i.test($.String.filename(file.name))){self.uploader.trigger('Error',{code:self.FILE_INVALID_ERROR,message:'File invalid error',file:file});self.uploader.removeFile(file);return false}file.element=doc.createElement('li');var status=doc.createElement('span');var size=doc.createElement('span');var name=doc.createElement('span');var rename=doc.createElement('span');var insert=doc.createElement('span');var input=doc.createElement('input');$(status).attr({'title':$.Plugin.translate('delete','Delete'),'role':'button'}).addClass('queue-item-status delete').click(function(){if(self.uploading){return self._stop(file)}return self._removeFile(file)});var title=$.String.basename(file.name);$(name).attr({'title':title,'role':'presentation'}).addClass('queue-item-name').append('<span class="queue-item-progress" role="presentation"></span><span class="queue-item-name-text">'+title+'</span>').appendTo(file.element);$(size).attr({'title':plupload.formatSize(file.size),'role':'presentation'}).addClass('queue-item-size').html(plupload.formatSize(file.size));$(input).attr({'type':'text','aria-hidden':true}).appendTo(name).hide();$(rename).attr({'title':$.Plugin.translate('rename','Rename'),'role':'button'}).addClass('queue-item-rename').not('.disabled').click(function(e){$('span.queue-item-name-text',name).click();e.preventDefault()});$(insert).attr({'title':$.Plugin.translate('upload_insert','Insert after upload'),'role':'button'}).click(function(e){$('li.queue-item span.queue-item-insert').each(function(){if(this==e.target){$(this).toggleClass('disabled').toggleClass('selected')}else{$(this).addClass('disabled').removeClass('selected')}})}).addClass('queue-item-insert disabled').toggle(self.options.insert);var buttons=[size,rename,insert,status];$.each(self.options.buttons,function(name,props){var btn=document.createElement('span');$(btn).attr({'title':(props.title||name),'role':'button'}).addClass(props['class']).click(function(){var fn=props.click||$.noop;fn.call(self,this)});buttons.push(btn)});$('<span class="queue-item-actions"></span>').appendTo(file.element).append(buttons);$('#upload-body').click(function(e){if($(e.target).is('input, span.queue-item-rename, span.queue-item-name-text',file.element))return;$(input).blur()});$('span.queue-item-name-text',name).click(function(e){if(self.uploading){e.preventDefault();return}var txt=this;$(this).hide();$(input).val($.String.stripExt(file.name)).show().attr('aria-hidden',false);$(input).bind('blur',function(){var v=$(input).val()+'.'+$.String.getExt($(txt).text());self._renameFile(file,v);$(txt).show().text(v);$(input).hide().attr('aria-hidden',true);$(rename).unbind('click.blur')});$(rename).bind('click.blur',function(){$(input).blur();$(rename).unbind('click.blur')});$(input).focus()});$(file.element).addClass('queue-item').addClass('file').addClass($.String.getExt(file.name)).appendTo($(self.element));self._trigger('fileSelect',null,file)})},_stop:function(file){this.uploader.stop();$(file.element).removeClass('load')},destroy:function(){this.uploader.destroy();$.Widget.prototype.destroy.apply(this,arguments)}});$.extend($.ui.uploader,{version:"2.0.12"})})(jQuery);