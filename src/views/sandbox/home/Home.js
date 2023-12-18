import React, { useState, useEffect, useRef } from 'react'
import { Card, Col, Row, List, Avatar, Drawer } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as Echarts from 'echarts'
import _ from 'lodash'
const { Meta } = Card;

export default function Home() {
    const [viewList, setviewList] = useState([])
    const [starList, setstarList] = useState([])
    const [allList, setallList] = useState([])
    const [visible, setvisible] = useState(false);
    const [pieChart, setpieChart] = useState(null);
    const barRef = useRef()
    const pieRef = useRef()
    //取得用户浏览量最多的数据
    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6").then(res => {
            setviewList(res.data)
        })
    }, [])

    //取得用户点赞最多的数据
    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=6").then(res => {
            setstarList(res.data)
        })
    }, [])

    useEffect(() => {
        //获取所有已发布的新闻信息
        axios.get("/news?publishState=2&_expand=category").then(res => {
            // console.log(res.data)
            // console.log()
            renderBarView(_.groupBy(res.data, item => item.category.title))
            setallList(res.data)
        })
        // 清除窗口事件
        return () => {
            window.onresize = null
        }
    }, [])
    const renderBarView = (obj) => {
        // 基于准备好的dom，初始化echarts实例
        var myChart = Echarts.init(barRef.current);

        // 指定图表的配置项和数据
        var option = {
            title: {
                text: '新闻分类图示'
            },
            tooltip: {},
            legend: {
                data: ['数量']
            },
            xAxis: {
                axisLabel: { rotate: "45" },
                interval: 1,
                data: Object.keys(obj)
            },
            yAxis: { minInterval: 1 },
            series: [
                {
                    name: '数量',
                    type: 'bar',
                    data: Object.values(obj).map(item => item.length)
                }
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);

        // 柱状图随着窗口改变而改变
        window.onresize = () => {
            myChart.resize()
        }
    }
    const renderPieView = (obj) => {
        //数据处理工作
        var currentList = allList.filter(item => item.author === username)
        var groupObj = _.groupBy(currentList, item => item.category.title)
        var list = []
        for (var i in groupObj) {
            list.push({
                name: i,
                value: groupObj[i].length
            })
        }

        var myChart;
        if (!pieChart) {
            myChart = Echarts.init(pieRef.current);
            setpieChart(myChart)
        } else {
            myChart = pieChart
        }
        var option;

        option = {
            title: {
                text: '当前用户新闻分类图示',
                subtext: 'Fake Data',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: '发布数量',
                    type: 'pie',
                    radius: '50%',
                    data: list,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        option && myChart.setOption(option);
    }

    const { username, region, role: { roleName } } = JSON.parse(localStorage.getItem("token"))
    return (
        <div className="site-card-wrapper">
            <Row gutter={16}>
                <Col span={8}>
                    <Card title="用户最常浏览" bordered={true}>
                        <List
                            size="small"
                            // bordered
                            dataSource={viewList}
                            renderItem={item => <List.Item><a href={`#/news-manage/preview/${item.id}`}>{item.title}

                            </a></List.Item>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="用户点赞最多" bordered={true}>
                        <List
                            size="small"
                            // bordered
                            dataSource={starList}
                            renderItem={item => <List.Item><a href={`#/news-manage/preview/${item.id}`}>{item.title}
                            </a></List.Item>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        cover={
                            <img
                                alt="example"
                                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                            />
                        }
                        actions={[
                            <SettingOutlined key="setting" onClick={() => {
                                setTimeout(() => {
                                    setvisible(true)
                                    // init初始化
                                    renderPieView()
                                }, 0)
                            }} />,
                            <EditOutlined key="edit" />,
                            <EllipsisOutlined key="ellipsis" />,
                        ]}
                    >
                        <Meta
                            avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            title={username}
                            description={
                                <div>
                                    <b>{region ? region : "全球"}</b>
                                    <span style={{
                                        paddingLeft: "30px"
                                    }}>{roleName}</span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>
            <Drawer
                width="500px"
                title="个人新闻分类"
                placement="right"
                closable={true}
                onClose={() => {
                    setvisible(false)
                }}
                visible={visible}
            >
                <div ref={pieRef} style={{
                    width: '100%',
                    height: "400px",
                    marginTop: "30px"
                }}></div>

            </Drawer>
            <div ref={barRef} style={{
                width: '100%',
                height: "400px",
                marginTop: "30px"
            }}></div>
        </div>
    )


}
