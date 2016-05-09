# fastLetter
基于JQuery的字母划分城市组件

![fastLetter](https://github.com/angel8731/fastLetter/blob/master/example/fastLetter.png)

>代码片段


`
$('#node').fastLetter({
    data : dataSource,				//数据源
    showCode : "cityCode",			//组件的key
    showValue : "cityName",			//组件的value
    groupKey : "cityCode",			//按照key进行分组
    selectAllCbk : function(){		//全选回调
        console.log('全选');
    },
    selectedCbk : function(){	    //选择节点回调
        console.log('选择节点')
    },
    cancelSelectCbk : function(){	//取消选择的回调
        console.log('取消选择回调');
    }
});
`

>对外暴露的接口
`
show方法 - 组件的显示
$('#node').fastLetter('show'); 

hide方法 - 组件的隐藏
$('#node').fastLetter('hide'); 

getItems方法 - 获取选中项
$('#node').fastLetter('getItems'); 

setItems方法 - 设置选中项，进行修改时常用
$('#node').fastLetter('setItems');
`