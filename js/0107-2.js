class DOMControlTest {
  #findId = 0;
  getFindId() {
    return this.#findId;
  }
  setFindId(id) {
    this.#findId = id;
  }
  #users = [
    {
      id: 1,
      name: "김철수",
      kor: 90,
      eng: 85,
      mat: 88,
      clss: "3-1",
    },
    {
      id: 2,
      name: "이영희",
      kor: 78,
      eng: 69,
      mat: 91,
      clss: "3-3",
    },
    // {
    //   id: 3,
    //   name: "박민수",
    //   kor: 75,
    //   eng: 69,
    //   mat: 82,
    //   clss: "3-2",
    // },
  ];

  printList() {
    $("#ulList").empty();
    this.#users.forEach((student) => {
      $("#ulList").append(this.getOneHtmlStudent(student));
    });
  }

  getOneHtmlStudent(student) {
    let oneHtml = `
<div class="dataLi oneRow">
  <div>
    <div>${student.id}</div>
  </div>
  <div>
    <div>${student.name}</div>
  </div>
  <div>
    <div>${student.kor}</div>
  </div>
  <div>
    <div>${student.eng}</div>
  </div>
  <div>
    <div>${student.mat}</div>
  </div>
  <div>
    <div>${student.clss}</div>
  </div>
</div>`;
    return oneHtml;
  }

  checkValidInput(checkId) {
    if (
      checkId !== "nocheckId" &&
      ($("#id").val().length < 1 ||
      this.#users.some((item) => {
        return item.id === $("#id").val() * 1;
      }))
    ) {
      alert("ID 값이 유효하지 않습니다. 없거나 이미 존재합니다.");
      $("#id").focus();
      return false;
    }
    if ($("#name").val().length < 2 || $("#name").val().length > 10) {
      alert("이름은 2자~10자까지 입력 가능 합니다.");
      $("#name").focus();
      return false;
    }
    if (
      $("#kor").val().length < 1 ||
      $("#kor").val() * 1 < 0 ||
      $("#kor").val() * 1 > 100
    ) {
      alert("KOR 점수는 0~100점 까지 입력 가능 합니다.");
      $("#kor").focus();
      return false;
    }
    if (
      $("#eng").val().length < 1 ||
      $("#eng").val() * 1 < 0 ||
      $("#eng").val() * 1 > 100
    ) {
      alert("ENG 점수는 0~100점 까지 입력 가능 합니다.");
      $("#eng").focus();
      return false;
    }
    if (
      $("#mat").val().length < 1 ||
      $("#mat").val() * 1 < 0 ||
      $("#mat").val() * 1 > 100
    ) {
      alert("MAT 점수는 0~100점 까지 입력 가능 합니다.");
      $("#mat").focus();
      return false;
    }
    if ($("#clss").val().length < 1) {
      alert("CLASS 반은 0글자 이상 입력 해야 합니다.");
      $("#clss").focus();
      return false;
    }
    return true;
  }

  addStudent() {
    /*
    0번.
      입력된 <input type="?" id="?" /> 데이터가 올바른지 체크를 하는 동작이 필요하다.
      체크를 했을때 모두 정상이면 1번, 2번을 실행한다.
      체크를 했을때 어떤 입력박스가 에러가 있다면 에러를 alert 로 출력하고 함수를 종료한다.
    1번.
    <input type="number" id="id" />
    <input type="text" id="name" />
    ....
    <input type="text" id="clss" /> 입력박스들
    의 value 값을 가져와서 아래의 형태로 javascript 객체로 만들어야 한다.
    {
      id: 3,
      name: "박민수",
      kor: 75,
      eng: 69,
      mat: 82,
      clss: "3-2",
    }
    2번
      1번에서 만든 객체를 this.#users 배열 뒤의 요소에 추가해야 한다.
    */
    if (!this.checkValidInput("uniqId")) {
      // <input type="?" id="?" 여러 입력박스에서 사용자가 제대로 입력했는지 검사
      // 입력 데이터가 제대로 없으면 그냥 return
      return;
    }
    let tmp = {
      // jQuery 를 이용하여 <input type="?" id="?" 입력박스의 value 값을
      // 키 : value 값 으로 설정하여 객체를 만든다.
      id: $("#id").val() * 1,
      name: $("#name").val(),
      kor: $("#kor").val(),
      eng: $("#eng").val(),
      mat: $("#mat").val(),
      clss: $("#clss").val(),
    };
    this.#users.push(tmp);
    // users 멤버변수인 배열에 tmp 를 맨 끝에 추가한다.
    this.clearInputBox();
  }

  clearInputBox() {
    // jQuery 를 이용하여 <input 입력 박스의 value 값을 "" 로 설정한다.
    $("#id").val("");
    $("#name").val("");
    $("#kor").val("");
    $("#eng").val("");
    $("#mat").val("");
    $("#clss").val("");
  }

  setInputBoxData(item) {
    // jQuery 를 이용하여 <input 입력 박스의 value 값을 item.속성 값으로 설정한다.
    $("#id").val(item.id);
    $("#name").val(item.name);
    $("#kor").val(item.kor);
    $("#eng").val(item.eng);
    $("#mat").val(item.mat);
    $("#clss").val(item.clss);
  }

  printItem(studentId) {
    // studentId 숫자값으로 users 멤버변수 배열에서 find 고차 함수를 이용하여
    // studentId 숫자와 users 멤버변수 배열의 모든 원소중에서 id 숫자가 같은 원소를 찾는다.
    // 찾은 원소를 매개변수로 해서 화면에 출력하는 setInputBoxData 함수를 호출한다.
    let findStudent = this.#users.find((item) => {
      return studentId === item.id;
    });
    if (findStudent == undefined) {
      return;
    }
    this.setInputBoxData(findStudent);
  }

  updateStudent() {
    /*
    1번.
    <input type="text" id="name" />
    ....
    <input type="text" id="clss" /> 입력박스들
    의 value 값을 가져와서 아래의 형태로 javascript 객체로 만들어야 한다.
    {
      id: 기존에서 찾았던 id 값,
      name: $("#name").val(),
      kor: $("#kor").val(),
      eng: $("#eng").val(),
      mat: $("#mat").val(),
      clss: $("#clss").val(),
    };
    2번
      1번에서 만든 객체를 this.#users 배열에서 기존에서 찾았던 id 값으로 찾은 원소로 바꿔치기 한다.
    */
    if (!this.checkValidInput("nocheckId")) {
      // <input type="?" id="?" 여러 입력박스에서 사용자가 제대로 입력했는지 검사
      // 입력 데이터가 제대로 없으면 그냥 return
      return;
    }
    let tmp = {
      // jQuery 를 이용하여 <input type="?" id="?" 입력박스의 value 값을
      // 키 : value 값 으로 설정하여 객체를 만든다.
      id: this.getFindId(),
      name: $("#name").val(),
      kor: $("#kor").val(),
      eng: $("#eng").val(),
      mat: $("#mat").val(),
      clss: $("#clss").val(),
    };
    // users 멤버변수인 배열에서 기존에찾은ID값으로 원소를 찾은 후에 tmp 로 바꿔치기 한다.
    let findIndex = this.#users.findIndex((item) => {
      return this.getFindId() === item.id;
    });
    if (findIndex < 0) {
      return;
    }
    // this.#users.with(findIndex, temp);
    this.#users[findIndex] = tmp;
    this.clearInputBox();
  }

  deleteStudent() {
    if (!this.checkValidInput("nocheckId")) {
      // <input type="?" id="?" 여러 입력박스에서 사용자가 제대로 입력했는지 검사
      // 입력 데이터가 제대로 없으면 그냥 return
      return;
    }
    // users 멤버변수인 배열에서 기존에찾은ID값으로 원소를 찾은 후에 tmp 로 바꿔치기 한다.
    let findIndex = this.#users.findIndex((item) => {
      return this.getFindId() === item.id;
    });
    if (findIndex < 0) {
      return;
    }
    this.#users.splice(findIndex, 1);
    this.clearInputBox();
  }
}

$(function () {
  // jQuery 에서 HTML 문서 로딩이 완료되면 실행하는 블록

  let domCtrl = new DOMControlTest();
  domCtrl.printList();

  $("#btnAddStudent").click(function (e) {
    // jQuery 의 선택된 요소에 마우스 클릭하면 실행하는 블록
    e.preventDefault();
    domCtrl.addStudent();
    domCtrl.printList();
    // domCtrl.clearInputBox();
  });

  $(document).on("click", ".dataLi", function (e) {
    // 동적인 DOM 에 이벤트를 생성하는 방법
    //alert(e.currentTarget);
    domCtrl.setFindId($(e.currentTarget).children().first().text() * 1);
    domCtrl.printItem(domCtrl.getFindId());
  });

  $("#btnUpdateStudent").click(function (e) {
    // jQuery 의 선택된 요소에 마우스 클릭하면 실행하는 블록
    e.preventDefault();
    domCtrl.updateStudent();
    domCtrl.printList();
    // domCtrl.clearInputBox();
  });

  $("#btnDeleteStudent").click(function (e) {
    // jQuery 의 선택된 요소에 마우스 클릭하면 실행하는 블록
    e.preventDefault();
    domCtrl.deleteStudent();
    domCtrl.printList();
    // domCtrl.clearInputBox();
  });
});
