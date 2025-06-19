``` abap
*&---------------------------------------------------------------------*
*& Include ZC103FIR0004TOP - 주석 추가 버전 (기능 동일, 변수명 유지)
*&---------------------------------------------------------------------*
REPORT zc103fir0004 MESSAGE-ID zmsgc103.

**********************************************************************
* 테이블 선언
**********************************************************************
TABLES: zc103fit0001,        " 전표 헤더 테이블
        zc103fit0002,        " 전표 아이템 테이블
        zc103mmt0002,        " 계정 마스터 테이블
        zc103mmt0012,        " 기타 마스터 테이블
        icon.                " SAP 아이콘 테이블

**********************************************************************
* GUI 클래스 인스턴스 (화면용 객체)
**********************************************************************
DATA: go_con            TYPE REF TO cl_gui_custom_container,        " 메인 컨테이너
      go_con2           TYPE REF TO cl_gui_custom_container,        " 서브 컨테이너
      go_split_top      TYPE REF TO cl_gui_splitter_container,      " 상단 분할 컨테이너
      go_mid_cont       TYPE REF TO cl_gui_container,               " 중단 컨테이너
      go_mid_alv        TYPE REF TO cl_gui_alv_grid,                " 중단 ALV 그리드
      go_split_btm      TYPE REF TO cl_gui_splitter_container,      " 하단 분할 컨테이너
      go_btm_cont       TYPE REF TO cl_gui_container,               " 하단 컨테이너
      go_btm_alv        TYPE REF TO cl_gui_alv_grid,                " 하단 ALV 그리드
      go_left_btm_cont  TYPE REF TO cl_gui_container,               " 좌측 하단 (전표 아이템)
      go_left_btm_alv   TYPE REF TO cl_gui_alv_grid,                " 좌측 하단 ALV (전표 아이템)
      go_right_btm_cont TYPE REF TO cl_gui_container,               " 우측 하단 (입금 내역)
      go_right_btm_alv  TYPE REF TO cl_gui_alv_grid.                " 우측 하단 ALV (입금 내역)

* 팝업 관련 컨트롤
DATA: go_pop_cont TYPE REF TO cl_gui_custom_container,              " 팝업 컨테이너
      go_pop_alv  TYPE REF TO cl_gui_alv_grid.                      " 팝업 ALV

**********************************************************************
* 내부 테이블 및 작업 영역
**********************************************************************
DATA: BEGIN OF gs_header,
        status TYPE icon_d.                                         " 상태 아이콘
        INCLUDE STRUCTURE zc103fit0001.
DATA:   END OF gs_header,
gs_header_db TYPE zc103fit0001,                               " DB 조회용
  gt_header    LIKE TABLE OF gs_header.                         " 전표 헤더 테이블

DATA: BEGIN OF gs_item.
        INCLUDE     STRUCTURE zc103fit0002.
DATA:   status      TYPE icon_d,                                     " 상태 아이콘
        bpid        TYPE zc103e_fi_kun,                              " 사업자 번호
        gl_name(10),                                                " 계정 이름
        modi_yn,                                                    " 수정 여부
        cell_tab    TYPE lvc_t_styl,                                 " 셀 스타일
        color       TYPE lvc_t_scol,                                 " 색상 정보
      END OF gs_item,
      gt_item      LIKE TABLE OF gs_item,                           " 전표 아이템 테이블
      gt_item_temp LIKE TABLE OF gs_item,                           " 임시 전표 아이템
      gs_item_temp LIKE gs_item.                                    " 임시 단일 행

DATA: BEGIN OF gs_11,
        ernam   TYPE zc103fit0011-ernam,                            " 생성자 ID
        empname TYPE zc103fit0011-empname,                          " 생성자 이름
      END OF gs_11,
      gt_11 LIKE TABLE OF gs_11.                                    " 생성자 정보 테이블

DATA: BEGIN OF gs_gl,
        saknr TYPE zc103fit0003-saknr,                              " 계정 번호
        txt50 TYPE zc103fit0003-txt50,                              " 계정 설명
      END OF gs_gl,
      gt_gl LIKE TABLE OF gs_gl.                                    " 계정 마스터 테이블

DATA: BEGIN OF gs_account.
        INCLUDE STRUCTURE zc103fit0020.
DATA: END OF gs_account,
gt_account LIKE TABLE OF gs_account.                          " 계좌 정보 테이블

**********************************************************************
* 필드 카탈로그 및 레이아웃 구조체
**********************************************************************
DATA: gs_fcat1 TYPE lvc_s_fcat,                                     " 필드 카탈로그 구조 1
      gt_fcat1 TYPE lvc_t_fcat,
      gs_fcat2 TYPE lvc_s_fcat,                                     " 필드 카탈로그 구조 2
      gt_fcat2 TYPE lvc_t_fcat,
      gs_fcat3 TYPE lvc_s_fcat,                                     " 필드 카탈로그 구조 3
      gt_fcat3 TYPE lvc_t_fcat.

DATA: gs_layout1      TYPE lvc_s_layo,                              " 레이아웃 설정 1
      gs_layout2      TYPE lvc_s_layo,                              " 레이아웃 설정 2
      gs_layout3      TYPE lvc_s_layo,                              " 레이아웃 설정 3
      gt_sort         TYPE lvc_t_sort,                              " 정렬 테이블
      gs_sort         TYPE lvc_s_sort,                              " 정렬 구조체
      gs_cell_tab     TYPE lvc_s_styl,                              " 셀 스타일
      gs_variant      TYPE disvariant,                              " ALV Variant
      gs_button       TYPE stb_button,                              " 툴바 버튼
      gt_ui_functions TYPE ui_functions.                            " ALV UI 기능 목록

**********************************************************************
* 공통 변수
**********************************************************************
DATA: gv_okcode        TYPE sy-ucomm,                               " 화면 OK 코드
      gv_tabix         TYPE sy-tabix,                               " LOOP 인덱스
      gv_subrc         TYPE sy-subrc,                               " Return Code
      gv_dbcnt         TYPE sy-dbcnt,                               " DB 처리 건수
      gv_str           TYPE string,                                 " 문자열 변수
      gv_int           TYPE i,                                      " 정수형 변수
      gv_msg(50),                                                  " 메시지 텍스트
      gv_none_cnt      TYPE i,                                      " 미처리 건수
      gv_finish_cnt    TYPE i,                                      " 완료 건수
      gv_search_bp(10),                                             " 사업자 번호 검색 조건
      gv_belnr         TYPE zc103fit0001-belnr,                     " 전표 번호
      gv_status,                                                   " 상태 코드
      gv_check(1),                                                 " 체크 여부
      gv_search(20).                                               " 검색어

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758
