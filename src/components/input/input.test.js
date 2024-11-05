import React from "react";
import { shallow } from "enzyme";
import Input from "./input";

describe("Input", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Input />);
    expect(wrapper).toMatchSnapshot();
  });
});
