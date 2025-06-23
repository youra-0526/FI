<mvc:View
    controllerName="employee.employeeedit.controller.employee"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:core="sap.ui.core"
    xmlns="sap.m"
    xmlns:t="sap.ui.table"
    xmlns:f="sap.ui.layout.form"
>
 <Page title="직원정보 생성 및 조회 프로그램">
    <content>
      <!-- ▶ 폼을 감싸는 VBox로 가운데 정렬 + 너비 지정 -->
      <VBox
        alignItems="Center"
        justifyContent="Start"
        class="sapUiSmallMargin"
      >
        <VBox width="400px">
          <f:SimpleForm editable="true" layout="ResponsiveGridLayout">
            <f:content>
              <Label text="부서" />
              <Select id="Dptcode" selectedKey="FI">
                <items>
                  <core:Item key="FI" text="FI - 회계부서" />
                  <core:Item key="MM" text="MM - 구매부서" />
                  <core:Item key="SD" text="SD - 판매부서" />
                  <core:Item key="PM" text="PM - 설비관리부서" />
                </items>
              </Select>

              <Label text="이름" />
              <Input id="Empname" />

              <Label text="전화번호" />
              <Input id="Telno" placeholder="010-1234-5678" />

              <Label text="생년월일 (YYYYMMDD)" />
              <Input id="Birth" />

              <Label text="성별" />
              <Select id="Gender" selectedKey="M">
                <items>
                  <core:Item key="M" text="남성" />
                  <core:Item key="W" text="여성" />
                </items>
              </Select>

              <Label text="이메일주소" />
              <Input id="Email" />

              <Label text="입사일자 (YYYYMMDD)" />
              <Input id="Joindate" />

              <Label text="직급" />
              <Select id="Emppos" selectedKey="01">
                <items>
                  <core:Item key="01" text="사원" />
                  <core:Item key="02" text="주임" />
                  <core:Item key="03" text="대리" />
                  <core:Item key="04" text="과장" />
                  <core:Item key="05" text="차장" />
                  <core:Item key="06" text="부장" />
                  <core:Item key="07" text="이사" />
                </items>
              </Select>

              <Button
                text="Create"
                press="onCreate"
                type="Emphasized"
                width="6rem"
                icon="sap-icon://write-new"
              />
            </f:content>
          </f:SimpleForm>
        </VBox>
      </VBox>

            <!-- ▶ 사원 목록 테이블 -->
            <t:Table
                id="EmployeeTable"
                rows="{/EmployeeSet}"
                visibleRowCount="10"
                selectionMode="None"
            >
                <t:columns>
                    <t:Column>
                        <t:label>
                            <Label text="사원번호" />
                        </t:label>
                        <t:template>
                            <Text text="{Empno}" />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="부서" />
                        </t:label>
                        <t:template>
                            <Text text="{Dptcode}" />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="이름" />
                        </t:label>
                        <t:template>
                            <Text text="{Empname}" />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="전화번호" />
                        </t:label>
                        <t:template>
                            <Text text="{Telno}" />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="생년월일" />
                        </t:label>
                        <t:template>
                            <Text text="{Birth}" />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="성별" />
                        </t:label>
                        <t:template>
                            <Text
                                text="{ path: 'Gender', formatter: '.formatGender' }"
                            />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="이메일주소" />
                        </t:label>
                        <t:template>
                            <Text text="{Email}" />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="입사일자" />
                        </t:label>
                        <t:template>
                            <Text text="{Joindate}" />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="퇴사일자" />
                        </t:label>
                        <t:template>
                            <Text
                                text="{ path: 'Resdate', formatter: '.formatResdate' }"
                            />
                        </t:template>
                    </t:Column>

                    <t:Column>
                        <t:label>
                            <Label text="직급" />
                        </t:label>
                        <t:template>
                            <Text
                                text="{ path: 'Emppos', formatter: '.formatPosition' }"
                            />
                        </t:template>
                    </t:Column>
                </t:columns>
            </t:Table>
        </content>
    </Page>
</mvc:View>
