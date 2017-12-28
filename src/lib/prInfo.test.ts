import { updateStackerInfo } from "./prInfo";

describe("PR info", () => {
  describe("updateStackerInfo", () => {
    it("adds meta comment with prefixing line breaks", () => {
      expect(updateStackerInfo("", { baseBranch: "foo" })).toMatch(
        '\n\n<!--{"baseBranch":"foo"}-->'
      );
    });

    it("replaces trailing line breaks", () => {
      expect(updateStackerInfo(`hello world`, { baseBranch: "foo" })).toMatch(
        'hello world\n\n<!--{"baseBranch":"foo"}-->'
      );
    });

    it("replaces trailing line breaks", () => {
      expect(
        updateStackerInfo('hello<!--{"baseBranch":"foo"}-->world', {
          baseBranch: "bar"
        })
      ).toMatch('helloworld\n\n<!--{"baseBranch":"bar"}-->');
    });

    it("keeps the same amount of line breaks between text and hidden comment", () => {
      expect(
        updateStackerInfo('hello world\n\n<!--{"baseBranch":"foo"}-->', {
          baseBranch: "bar"
        })
      ).toMatch('hello world\n\n<!--{"baseBranch":"bar"}-->');
    });
  });
});
