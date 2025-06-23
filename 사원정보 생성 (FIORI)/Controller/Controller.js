sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], (Controller, MessageToast) => {
  "use strict";

  return Controller.extend("employee.employeeedit.controller.employee", {
    onInit() {
      const oModel = this.getView().getModel();
      if (!oModel) {
        MessageToast.show("OData 모델이 필요합니다.");
        return;
      }

      oModel.read("/EmployeeSet", {
        success: () => {
          // 초기 로딩 성공
        },
        error: () => {
          MessageToast.show("직원 데이터 조회 실패");
        }
      });
     // 3. 직급/부서 매핑 모델 추가
  const oLookup = {
    Dept: {
      FI: "회계부서",
      MM: "구매부서",
      SD: "판매부서",
      PM: "설비관리부서"
    },
    Pos: {
      "01": "사원",
      "02": "주임",
      "03": "대리",
      "04": "과장",
      "05": "차장",
      "06": "부장",
      "07": "이사"
    }
  };
  const oJsonModel = new sap.ui.model.json.JSONModel(oLookup);
  this.getView().setModel(oJsonModel, "Lookup");
},

    onCreate() {
      const oView = this.getView();
      const oModel = oView.getModel();

      const formatBirth = (s) => {
        if (!s) return "";
        const clean = s.replaceAll(/[^0-9]/g, "");
        if (clean.length === 6) { // e.g. 981023
          return "19" + clean;    // 기본적으로 1900년대 처리
        } else if (clean.length === 8) {
          return clean;           // e.g. 19981023
        }
        return "";
      };

      const formatDate = (s) => {
        if (!s) return "";
        const clean = s.replaceAll(/[^0-9]/g, "");
        return clean.length === 8 ? clean : "";
      };

      const oEntry = {
        Dptcode: oView.byId("Dptcode").getSelectedKey(),
        Empname: oView.byId("Empname").getValue(),
        Telno: oView.byId("Telno").getValue(),
        Birth: formatBirth(oView.byId("Birth").getValue()),       // CHAR(8)
        Gender: oView.byId("Gender").getSelectedKey(),
        Email: oView.byId("Email").getValue(),
        Joindate: formatDate(oView.byId("Joindate").getValue()),
        Emppos: oView.byId("Emppos").getSelectedKey()
      };

      // 필수 입력값 확인
      if (!oEntry.Empname || !oEntry.Email || !oEntry.Dptcode) {
        MessageToast.show("이름, 이메일, 부서는 필수 입력입니다.");
        return;
      }

      oModel.create("/EmployeeSet", oEntry, {
        success: (oData) => {
          MessageToast.show(`직원 등록 성공! 사번: ${oData.Empno}`);
          oModel.refresh(true);
        },
        error: (oError) => {
          MessageToast.show("직원 등록 실패");
        }
      });
    },
     // 🔽 여기 추가
 formatPosition: function (sKey) {
  if (!sKey) {
    return "??"; // 혹은 "", "미정" 등
  }

  const posMap = {
    "01": "사원",
    "02": "주임",
    "03": "대리",
    "04": "과장",
    "05": "차장",
    "06": "부장",
    "07": "이사",
    "08": "대표"
  };

  const key = String(sKey).padStart(2, "0"); // 혹시 숫자여도 안전하게 변환
  return posMap[key] || sKey;
},

formatGender: function (sKey) {
  if (!sKey) return "??";
  const genderMap = {
    "M": "남성",
    "W": "여성"
  };
  return genderMap[sKey] || sKey;
}

  });
});
