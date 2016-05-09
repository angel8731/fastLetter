+function( window, document, undefined ) {

    +function( factory ){
        'use strict';

        if (typeof define === 'function' && define.amd) {
            // AMD模式
            define('js/fastLetter.js', factory);
        } else {
            // 全局模式
            factory();
        }

    }(function() {
        var pluginName = 'fastLetter', //组件名称
            defaultOptions = {         //默认参数
                groupKey : '', //按照哪个key进行分类
                showCode : '',//显示code
                showValue : '',//按照哪个value进行显示
                selectAllCbk : $.noop(), //全选的回调
                selectedCbk : $.noop(),//选择节点的回调
                cancelSelectNode : $.noop(), //取消节点的回调
                hasSelected : [], //已选
                hasSelectedKey : '',//已选的key
                hasSelectedValue : ''//已选的value
            },
            ignoredKeyCode = [9, 13, 17, 19, 20, 27, 33, 34, 35, 36, 37, 39, 44, 92, 113, 114, 115, 118, 119, 120, 122, 123, 144, 145];
        function FastLetter(element,options){

            this.element = element;

            this.settings = $.extend({},defaultOptions,options);

            this.hasSelected = this.settings.hasSelected; //已选择节点集合

            this.searchIndex = 0;// 搜索选中节点，处理样式

            this.searchSelectedValue = '';

            this.dataStructure = [
                {
                    "name" : "ABCDE",
                    "matchData" : {}
                },
                {
                    "name" : "FGHJ",
                    "matchData" : {}
                },
                {
                    "name" : "KLMNP",
                    "matchData" : {}
                },
                {
                    "name" : "QRSTW",
                    "matchData" : {}
                },
                {
                    "name" : "XYZ",
                    "matchData" : {}
                }
            ];

            this.init();
        }
        FastLetter.prototype = {
            //初始化组件
            init : function(){
                this.formatDatas();
                this.create();
                this.bindEvent();
            },
            //创建组件
            create : function(){
                var fastLetterUI = '<div class="fastLetter">' +
                    '<div class="fastLetter-main">' +
                    '<div class="uiblock">' +
                    '<div class="block-close"></div>' +
                //已选
                    '<div class="hasSelected">' +
                    '<div class="selectedTitle"><input name="checkall" type="checkbox" class="J_checkall" /><span class="checkall"> 全选</span></div>' +
                    '<div class="selectedTitle">已选择：</div>' +
                    '<div class="hasSelectedNode">';
                fastLetterUI += this.renderHasSelected();
                fastLetterUI += '</div></div>';
                fastLetterUI += this.renderLetter();
                fastLetterUI += this.renderContent();
                fastLetterUI += '</div></div></div>';
                this.render(fastLetterUI);

                this.renderContentSelectedNode();
            },
            //渲染组件已选节点
            renderHasSelected : function(repeatRender){
                var _this = this,
                    selectedUI = '';
                _this.formatHasSelect();
                if(_this.hasSelected.length>0){
                    var i = 0,len = _this.hasSelected.length;
                    for(;i<len;i++){
                        selectedUI += '<div class="selected-block">' +
                        '<span class="selected-value" data-code="'+_this.hasSelected[i].code+'">'+_this.hasSelected[i].value+'</span>' +
                        '<span class="ace-icon fa fa-times bigger-110 red selected-close" data-code="'+_this.hasSelected[i].code+'">x</span>' +
                        '</div>';
                    }
                }
                if(repeatRender){
                    $(_this.element).find('.hasSelectedNode').html(selectedUI);
                    _this.renderContentSelectedNode();
                    return;
                }
                return selectedUI;
            },
            //渲染组件letter
            renderLetter : function(){
                var _this = this,
                    letters = '',
                    len = _this.dataStructure.length,
                    i = 0;
                letters += '<div class="letters">';
                for(;i<len;i++){
                    if(i==0){
                        letters += '<div class="letterTitle active" data-tab-id="'+_this.dataStructure[i].name+'">'+_this.dataStructure[i].name+'<i class="i1"></i><i class="i2"></i></div>';
                    }else{
                        letters += '<div class="letterTitle" data-tab-id="'+_this.dataStructure[i].name+'">'+_this.dataStructure[i].name+'<i class="i1"></i><i class="i2"></i></div>';
                    }
                }
                //添加搜索功能
                letters +='<div class="letterSearch">' +
                '<input type="text" class="searchInput" placeholder="输入关键词" />' +
                '<div class="autocompleter autocompleter-hide">' +
                '<ul class="autocompleter-list">' +
                '<li class="autocompleter-item">lalalala</li>' +
                '<li class="autocompleter-item">lalalala</li>' +
                '<li class="autocompleter-item">lalalala</li>' +
                '<li class="autocompleter-item autocompleter-item-selected">lalalala</li>' +
                '</ul>' +
                '</div>' +
                '</div>';
                letters += '</div>';
                return letters;
            },
            //渲染组件content
            renderContent : function(){
                var _this = this,
                    content = '<div class="contentList">',
                    len = _this.dataStructure.length,
                    i = 0;
                for(;i<len;i++){
                    content += '<div class="letterContent" data-panel-id="'+_this.dataStructure[i].name+'" style="'+(i === 0 ? 'display:block;':'')+'">';
                    for(var prop in _this.dataStructure[i].matchData){
                        content += '<dl class="eachletters"><dt class="letterHeader">'+prop+'</dt>';
                        content += '<dd class="letterBody"><ul>';

                        var ulLen = _this.dataStructure[i].matchData[prop].length;
                        for(var k=0;k<ulLen;k++){

                            content += '<li><a class="js-hotcitylist" data-code="'+_this.dataStructure[i].matchData[prop][k][_this.settings.showCode]+'" data-value="'+_this.dataStructure[i].matchData[prop][k][_this.settings.showValue]+'" href="javascript:;">'+_this.dataStructure[i].matchData[prop][k][_this.settings.showValue]+'</a></li>';
                        }
                        content += '</ul></dd></dl>';
                    }
                    content += '</div>';
                }
                content += '</div>';
                return content
            },
            //渲染组件
            render : function(htmlObj){
                $(this.element).append(htmlObj);
            },
            //显示组件
            show : function(args){
                $(this).find('.fastLetter').show();
            },
            //隐藏组件
            hide : function(){
                $(this).find('.fastLetter').hide();
            },
            //渲染已选中content中节点
            renderContentSelectedNode : function(){
                var _this = this,
                    i = 0,
                    len = _this.hasSelected.length,
                    $elem = $(_this.element);
                for(;i<len;i++){
                    $elem.find('.js-hotcitylist').each(function(idx,el){
                        var code = $(el).data('code');
                        if(_this.hasSelected[i].code == code+''){
                            $(el).addClass('activeNode').data('selected',true);
                        }
                    });
                }
            },
            bindEvent : function(){
                var _this = this;
                //主动触发关闭组件
                $(_this.element).on('click','.block-close',function(evt){
                    $(_this.element).find('.fastLetter').hide().data('showCase',false);
                    $(_this.element).data('showCase',false)
                });
                //tab切换
                $(_this.element).on('click','.letterTitle',_this.selectTab.bind(_this));
                //选择节点
                $(_this.element).on('click','.js-hotcitylist',_this.selectedNode.bind(_this));
                //取消选中节点 -- 叉子取消
                $(_this.element).on('click','.selected-close',_this.cancelSelected.bind(_this));
                //取消选中节点 -- 节点取消
                $(_this.element).on('click','.js-hotcitylist',_this.cancelSelected.bind(_this));
                //全选/反选
                $(_this.element).on('click','.J_checkall',_this.selectAll.bind(_this));

                //自动选择事件
                $(_this.element).on('keyup','.searchInput',_this._onKeyup.bind(_this));

                $(_this.element).on('focus','.searchInput',_this._onFocus.bind(_this));
                $(_this.element).on('blur','.searchInput',_this._onBlur.bind(_this));
                $(_this.element).on('keydown','.searchInput',_this._onKeydown.bind(_this));
                $(_this.element).on('click','.autocompleter-item',_this._onClick.bind(_this));
            },
            //切换tab
            selectTab : function(evt){
                var _this = this,
                    tabId = $(evt.currentTarget).data('tab-id'),
                    $panels = $(_this.element).find('.letterContent');
                //remove掉选中状态
                $(_this.element).find('.letterTitle').removeClass('active');
                //为当前tab添加选中
                $(evt.currentTarget).addClass('active');
                $panels.removeClass('active');
                $panels.each(function(index,elem){
                    var panelId = $(elem).data('panel-id');
                    $(elem).hide();
                    if(panelId == tabId){
                        $(elem).show();
                    }
                });
                evt.preventDefault();
                evt.stopImmediatePropagation()
            },
            //扩展，通过参数切换Tab
            selectTabHelp : function(tabId,pannelIndex, rowIndex, posIndex){
                var _this = this,
                    lettets = $(_this.element).find('.letters .letterTitle');;
                $(_this.element).find('.letterTitle').removeClass('active');
                $panels = $(_this.element).find('.letterContent');

                lettets.eq(pannelIndex).addClass('active');

                $panels.each(function(index,elem){

                    var panelId = $(elem).data('panel-id');
                    $(elem).hide();
                    if(panelId == tabId){
                        $(elem).show();
                    }
                });
                //高亮显示
                var node = $(_this.element).find('.letterContent').eq(pannelIndex);
                node.find('.letterHeader').each(function(index,row){
                    if($(row).html() == rowIndex){
                        node.find('.letterBody').eq(index).find('a').eq(posIndex).addClass('focusHigh');
                    }
                })
            },
            //选中节点
            selectedNode : function(evt){
                var _this = this,
                    $elem = $(evt.currentTarget),
                    code = $elem.data('code'),
                    value = $elem.data('value');

                if($elem.data('selected')){
                    return;
                }
                $elem.addClass('activeNode').data('selected',true);

                _this.hasSelected.push({
                    code : code,
                    value : value
                });
                $(_this.element).find('.hasSelectedNode').html(_this.renderHasSelected());
                //触发回调
                $.isFunction(_this.settings.selectedCbk) ? _this.settings.selectedCbk() : "";

                evt.preventDefault();
                evt.stopImmediatePropagation()
            },
            //取消选中
            cancelSelected : function(evt){
                var _this = this,
                    $elem = $(evt.currentTarget),
                    code = $elem.data('code'),
                    i = 0,
                    len = _this.hasSelected.length;
                for(;i<len;i++){
                    if(code == _this.hasSelected[i].code){
                        _this.hasSelected.splice(i,1);
                        $(_this.element).find('.hasSelectedNode').html(_this.renderHasSelected());
                        $(_this.element).find('.js-hotcitylist[data-code="'+code+'"]').removeClass('activeNode').data('selected',false);
                        break;
                    }
                }
                //触发回调
                $.isFunction(_this.settings.cancelSelectCbk) ? _this.settings.cancelSelectCbk() : "";
                evt.preventDefault();
                evt.stopImmediatePropagation()
                return false;
            },
            //全选/反选
            selectAll : function(evt){
                var _this = this,
                    $elem = $(evt.currentTarget);
                //清空之前所选的
                _this.hasSelected = [];
                if($elem.prop('checked')){
                    $(_this.element).find('.js-hotcitylist').each(function(index,elem){
                        $(elem).addClass('activeNode').data('selected',true);
                        _this.hasSelected.push({
                            code : $(elem).data('code'),
                            value : $(elem).data('value')
                        })
                    });
                }else{
                    $(_this.element).find('.js-hotcitylist').each(function(index,elem){
                        $(elem).removeClass('activeNode').data('selected',false);
                    });
                }
                $(_this.element).find('.hasSelectedNode').html(_this.renderHasSelected());
                //触发回调
                $.isFunction(_this.settings.selectAllCbk) ? _this.settings.selectAllCbk() : "";
                evt.stopImmediatePropagation()
            },
            //键盘按下操作
            _onKeyup : function(e){
                var _this = this,
                    code = e.keyCode ? e.keyCode : e.which,
                    node = $(e.currentTarget),
                    query = $.trim(node.val()),
                    lis = node.next().find('ul li'),
                    direction;

                if( (code ===40 || code === 38) ){
                    if(lis.length > 0){
                        direction = (code == 38 ? 'up' : 'down');
                        lis.removeClass('autocompleter-item-selected');
                        switch(direction){
                            case 'down' : (function(){
                                _this.searchIndex++;
                                _this._handleSelected(lis);
                            })();break;
                            case 'up' : (function(){
                                _this.searchIndex--;
                                _this._handleSelected(lis);
                            })();
                        }
                    }
                }else{
                    //按键是否在黑名单里
                    if($.inArray(code,ignoredKeyCode) === -1){
                        this._search(query);
                    }
                }
            },
            //上下选择样式处理
            _handleSelected : function(lis){

                var _this = this,
                    len = lis.length;
                if(_this.searchIndex > len-1){
                    _this.searchIndex = 0;
                }else if(_this.searchIndex < 0){
                    _this.searchIndex = len-1;
                }
                _this.searchSelectedValue = lis.eq(_this.searchIndex).attr('ctValue');
                lis.eq(_this.searchIndex).addClass('autocompleter-item-selected')
            },
            _onClick : function(e){
                e.preventDefault();
                e.stopPropagation();
                this._select(e);

            },
            //按下处理
            _onKeydown : function(e){
                var _this = this,
                    code = e.keyCode ? e.keyCode : e.which;
                if (code === 40 || code === 38 ) {
                    e.preventDefault();
                    e.stopPropagation();
                }else if (code === 13) {
                    // Enter
                    if ($(_this.element).find('.autocompleter').hasClass('autocompleter-show') && _this.searchSelectedValue) {
                        _this._select(e);
                    }
                }else{
                    //去除高亮
                    $(_this.element).find('.js-hotcitylist').removeClass('focusHigh');
                }
            },
            _select : function(e){
                var _this = this,
                    node = $(e.currentTarget),
                    lis = $(_this.element).find('.autocompleter-list .autocompleter-item'),

                    selectedLi = lis.eq(_this.searchIndex),
                    tabId = selectedLi.attr('tabid'),
                    pannelIndex = selectedLi.attr('pannelindex'),
                    rowIndex = selectedLi.attr('rowindex'),
                    posIndex = selectedLi.attr('posindex');
                $(_this.element).find('.autocompleter').removeClass('autocompleter-show').addClass('autocompleter-hide');
                node.val(_this.searchSelectedValue);

                //管理tab的状态
                _this.selectTabHelp(tabId,pannelIndex, rowIndex, posIndex);
            },
            //获取焦点
            _onFocus : function(e){
                //搜索为组件内部应用，暂不支持jqxhr调取
                var node = $(e.currentTarget),
                    query = $.trim(node.val());
                if(query.length !== 0){
                    this._search(query);
                }
                $(e.currentTarget).next().addClass('autocompleter-focus');
            },
            //失去焦点
            _onBlur : function(e){
                //$(e.currentTarget).next().removeClass('autocompleter-focus,autocompleter-show').addClass('autocompleter-hide');
            },
            _close : function(e){
                if($(this.element).find('.autocompleter').hasClass("autocompleter-show")){
                    $(this.element).find('.autocompleter').removeClass('autocompleter-show').addClass('autocompleter-hide')
                }
            },
            _search : function(query){
                if(query.length === 0){
                    this._clear();
                    return;
                }
                var _this = this,
                    response = [],
                    i = 0,
                    dataSource = _this._clone(_this.dataStructure),
                    len = dataSource.length;
                for(;i<len;i++){
                    for(var letter in dataSource[i].matchData){

                        for(var item in dataSource[i].matchData[letter]){

                            var tempItem = dataSource[i].matchData[letter][item],
                                matchData = _this._searchHelp(query, tempItem[_this.settings.showValue]);

                            if(matchData != ''){
                                response.push({
                                    matchValue : matchData,   //匹配的数据
                                    tabId : dataSource[i].name, //tabId
                                    pannelIndex : i,          //面板的索引
                                    rowIndex : letter,        //行索引
                                    posIndex : item           //位置索引
                                });
                            }

                        }
                    }
                }
                if(response.length > 0){
                    _this._response(response);
                }else{
                    var tempLi = '<li class="autocompleter-item">没有搜索到数据!</li>';
                    $(_this.element).find('.autocompleter').addClass('autocompleter-show').removeClass('autocompleter-hide').find('ul').html(tempLi);
                }
            },
            //处理字符个数，让字符按位数匹配
            _searchHelp : function(query, source){
                var matchStr = [],
                    len = query.length;

                if(query == source.substr(0,len)){
                    return source;
                }
                return '';
            },
            _clone : function(obj) {
                if (null === obj || "object" !== typeof obj) {
                    return obj;
                }
                var copy = obj.constructor();
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) {
                        copy[attr] = obj[attr];
                    }
                }
                return copy;
            },
            _response : function(response){
                var _this = this,list='';
                list = _this._buildList(response);
                $(_this.element).find('.autocompleter').addClass('autocompleter-show').removeClass('autocompleter-hide').find('ul').html(list);
            },
            _buildList : function(response){
                var _this = this,
                    searchList = '',
                    i = 0;
                for(;i<response.length;i++){
                    if(i == 0){
                        _this.searchSelectedValue = response[i]['matchValue'];
                        searchList += '<li class="autocompleter-item autocompleter-item-selected" tabid="'+response[i]['tabId']+'" pannelindex="'+response[i]['pannelIndex']+'" rowindex="'+response[i]['rowIndex']+'" posindex="'+response[i]['posIndex']+'" ctValue="'+response[i]['matchValue']+'">'+response[i]['matchValue']+'</li>';
                    }else{
                        searchList += '<li class="autocompleter-item" pannelindex="'+response[i]['pannelIndex']+'" tabid="'+response[i]['tabId']+'" rowindex="'+response[i]['rowIndex']+'" posindex="'+response[i]['posIndex']+'" ctValue="'+response[i]['matchValue']+'">'+response[i]['matchValue']+'</li>';
                    }
                }
                return searchList;
            },
            _clear : function(){
                var _this = this;
                $(_this.element).find('.autocompleter-list').html('');
                _this.searchIndex = 0;
                _this.searchSelectedValue = '';
            },
            //格式化数据，组装成按字母表的形式的数据
            formatDatas : function(){
                var _this = this,
                    originData = this.settings.data,
                    len = originData.length, i = 0, item={},
                    letters, tempAlphaArr=[], tempObj, resultArr=[];
                for(;i<len;i++){
                    tempObj = originData[i];
                    //判断groupKey是否存在，若存在截取第一个字母为key
                    letters = tempObj&&tempObj[this.settings.groupKey] ? tempObj[this.settings.groupKey].substr(0,1) : "";
                    _this.filterData(letters,tempObj)
                }

            },
            filterData : function(letters,item){
                var _this = this,
                    i = 0,
                    len = _this.dataStructure.length,
                    letters = letters.toUpperCase();
                for(;i<len;i++){
                    var tempArr = _this.splitData(_this.dataStructure[i].name);

                    if($.inArray(letters.toUpperCase()+'',tempArr) != -1){

                        if(_this.dataStructure[i].matchData[letters] == undefined){
                            _this.dataStructure[i].matchData[letters] = [];
                            _this.dataStructure[i].matchData[letters].push(item);
                        }else{
                            _this.dataStructure[i].matchData[letters].push(item);
                        }
                    }
                }

            },
            splitData : function(structureName){
                var _this = this, i = 0, len = structureName.length, tempArr = [];
                for(;i<len;i++){
                    tempArr.push(structureName.substr(i,1));
                }
                return tempArr;
            },
            /*
            *   编辑已选数据结构，符合组件已选格式
            *   hasSelected = [
            *       {
            *           code : code,
            *           value : value
            *       }
            *   ]
            * */
            formatHasSelect : function(){
                var _this = this,
                    i = 0,
                    len = _this.hasSelected.length;
                for(;i<len;i++){
                    //判断结构是否正确
                    if(_this.hasSelected[i].code == undefined || _this.hasSelected[i].value == undefined){
                        for(var key in _this.hasSelected[i]){
                            _this.hasSelected[i].code = _this.hasSelected[i][_this.settings.hasSelectedKey];
                            _this.hasSelected[i].value = _this.hasSelected[i][_this.settings.hasSelectedValue];
                        }
                    }
                }
            },
            //获取已选数据
            getItems : function(that){
                //根据showCode,showValue拼装返回的数据

                var _this = this,
                    i = 0,
                    len = _this.hasSelected.length,
                    returnArr = [];

                for(;i<len;i++){
                    var tempObj = {};
                    tempObj[_this.settings.showCode] = _this.hasSelected[i].code;
                    tempObj[_this.settings.showValue] = _this.hasSelected[i].value;
                    returnArr.push(tempObj);
                }
                return returnArr;
            },
            //设置选中数据
            setItems : function(that,options){
                this.hasSelected = options.hasSelected;
                this.settings.hasSelectedKey = options.hasSelectedKey;
                this.settings.hasSelectedValue = options.hasSelectedValue;
                //重新渲染选中节点
                this.renderHasSelected(true);
            }
         }
        //暴露对外的接口，使用全局变量
        var interfaceForOuter = ['getItems','setItems'];

        $.fn[pluginName] = function(options,params){
            if(typeof options === 'string'){
                var instance = $(this).data('fastLetter');
                if(instance instanceof FastLetter && typeof instance[options] === 'function'){
                    var args = Array.prototype.slice.call(arguments);
                    //区分外部接口调用
                    if($.inArray(options,interfaceForOuter)>-1){
                        return instance[options].apply(instance,$.extend(args,params));
                    }else{
                        instance[options].apply(this,args);
                    }
                }
            }else{
                return this.each(function(){
                    //this代表当前元素对象
                    var FL = new FastLetter(this,options);
                    $(this).data('fastLetter',FL);
                });
            }
        }
    })

}(window, document);

