<mvc:View
    controllerName="zsair.bpsumchart.controller.bpsum_chart"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:core="sap.ui.core"
    xmlns:layout="sap.ui.layout"
    xmlns:viz="sap.viz.ui5.controls"
    xmlns:viz.feeds="sap.viz.ui5.controls.common.feeds"
    xmlns:viz.data="sap.viz.ui5.data"
    height="100%"
>

<!-- ✅ Dialog를 IconTabBar 바깥에 위치시킴 -->
    <Dialog id="bpSummaryDialog" title="BP 요약 정보">
        <VBox class="sapUiSmallMargin">
            <Text text="BP ID: {bpSummary>/SelectedBP/Bpid}" />
        <Text text="BP명: {bpSummary>/SelectedBP/Bpname}" />
        <Text text="해당 월 총거래 건수: {bpSummary>/SelectedBP/TotalCount}" />
        <Text text="거래 시작 후 경과일: {bpSummary>/SelectedBP/DaysSinceFirstTransaction}일" />
        </VBox>
        <beginButton>
            <Button text="닫기" press=".onDialogClose" />
        </beginButton>
    </Dialog>

    <!-- 🔹 IconTabBar로 화면 전환 구성 시작 -->
    <IconTabBar id="tabBar" class="sapUiResponsiveContentPadding">
        <items>
            <!-- 📊 차트 + 상세 테이블 탭 -->
            <IconTabFilter key="chart" text="📊 BP별 거래차트">
                <VBox height="100%">
                    <!-- 조회조건 패널 -->
                    <Panel headerText="조회조건" expandable="true" expanded="true">
                        <HBox>
                            <VBox>
                                <Label text="연도" />
                                <Select id="yearSelect">
                                    <items>
                                        <core:Item key="2023" text="2023" />
                                        <core:Item key="2024" text="2024" />
                                        <core:Item key="2025" text="2025" />
                                    </items>
                                </Select>
                            </VBox>
                            <VBox>
                                <Label text="월" />
                                <Select id="monthSelect">
                                    <items>
                                        <core:Item key="01" text="01" />
                                        <core:Item key="02" text="02" />
                                        <core:Item key="03" text="03" />
                                        <core:Item key="04" text="04" />
                                        <core:Item key="05" text="05" />
                                        <core:Item key="06" text="06" />
                                        <core:Item key="07" text="07" />
                                        <core:Item key="08" text="08" />
                                        <core:Item key="09" text="09" />
                                        <core:Item key="10" text="10" />
                                        <core:Item key="11" text="11" />
                                        <core:Item key="12" text="12" />
                                    </items>
                                </Select>
                            </VBox>
                            <VBox justifyContent="End" alignItems="Center">
                                <Button text="조회" icon="sap-icon://search" press="onSearchYearMonth" />
                            </VBox>
                        </HBox>
                    </Panel>

                    <!-- 차트 -->
                    <viz:VizFrame
                        id="idVizFrame"
                        uiConfig="{applicationSet:'fiori'}"
                        height="500px"
                        width="100%"
                        vizType="column"
                        selectData="onChartClick"
                        vizProperties='{
                            "title": {
                                "visible": true,
                                "text": "BP별 매입거래 차트"
                            },
                            "plotArea": {
                                "dataLabel": {
                                    "visible": true
                                }
                            }
                        }'>
                        <viz:dataset>
                            <viz.data:FlattenedDataset data="{/BPSearchsumSet}">
                                <viz.data:dimensions>
                                    <viz.data:DimensionDefinition name="BP" value="{Bpname}" />
                                </viz.data:dimensions>
                                <viz.data:measures>
                                    <viz.data:MeasureDefinition name="거래금액(원)" value="{Totaldmbtr}" />
                                </viz.data:measures>
                            </viz.data:FlattenedDataset>
                        </viz:dataset>
                        <viz:feeds>
                            <viz.feeds:FeedItem uid="valueAxis" type="Measure" values="거래금액(원)" />
                            <viz.feeds:FeedItem uid="categoryAxis" type="Dimension" values="BP" />
                        </viz:feeds>
                        <viz:dependents>
                            <viz:Popover id="idPopOver" />
                        </viz:dependents>
                    </viz:VizFrame>

                    <!-- ✅ 하단 테이블 추가 -->
                   <Panel>
    <headerToolbar>
        <Toolbar>
            <Label text="세부 거래내역" design="Bold"/>
            <ToolbarSpacer/>
            <Label text="BP명 필터" class="sapUiTinyMarginEnd"/>
            <Select id="detailBpnameSelect"
                    width="180px"
                    change="onDetailBpnameChange">
                
            </Select>
        </Toolbar>
    </headerToolbar>
    <content>
        <ScrollContainer height="400px" vertical="true">
            <Table id="detailTable" items="{detail>/DetailSet}" growing="true" growingScrollToLoad="true" growingThreshold="20">
                <columns>
                    <Column><Text text="회사코드" /></Column>
                    <Column><Text text="전표번호" /></Column>
                    <Column><Text text="전기일자" /></Column>
                    <Column><Text text="항목번호" /></Column>
                    <Column><Text text="아이템적요" /></Column>
                    <Column><Text text="BP명" /></Column>
                    <Column><Text text="금액" /></Column>
                    <Column><Text text="통화키" /></Column>
                </columns>
                <items>
                    <ColumnListItem>
                        <cells>
                            <Text text="{detail>Bukrs}" />
                            <Text text="{detail>Belnr}" />
                            <Text text="{detail>BudatText}" />
                            <Text text="{detail>Buzei}" />
                            <Text text="{detail>Sgtxt}" />
                            <Text text="{detail>BpName}" />
                            <Text text="{
                                path: 'detail>Dmbtr',
                                formatter: '.formatAmountWithComma'
                            }" />
                            <Text text="{detail>Waers}" />
                        </cells>
                    </ColumnListItem>
                </items>
            </Table>
        </ScrollContainer>
    </content>
</Panel>

                </VBox>
            </IconTabFilter>

            <!-- 🏆 순위 탭 -->
            <IconTabFilter key="rank" text="🏆 거래액 상위 BP 순위">
                <VBox class="sapUiSmallMargin">
                    <Table items="{rank>/TopBpList}">
                        <columns>
                            <Column><Text text="순위" /></Column>
                            <Column><Text text="BP명" /></Column>
                            <Column><Text text="총 거래금액(원)" /></Column>
                        </columns>
                        <items>
                            <ColumnListItem>
                                <cells>
                                    <Text text="{rank>Rank}" />
                                    <Text text="{rank>Bpname}" />
                                    <Text text="{rank>Totaldmbtr}" />
                                </cells>
                            </ColumnListItem>
                        </items>
                    </Table>
                </VBox>
            </IconTabFilter>
        </items>
    </IconTabBar>
</mvc:View>
