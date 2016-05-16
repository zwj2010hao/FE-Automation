// 首页获取招聘效果数据接口
$.mockjax({
    url: '/recruit/data/browsed',
    data:'json',
    responseText: {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        y: [10, 50, 30, 20, 15, 16, 25, 66, 51, 33, 17, 56]
    }
});