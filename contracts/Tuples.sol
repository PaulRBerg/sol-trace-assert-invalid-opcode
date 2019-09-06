pragma solidity 0.5.10;

contract Tuples {

    function a() public view returns (uint256, uint256) {
        uint256 i = block.number;
        uint256 ii = block.number + 1;
        uint256 j = i + 1;
        // should be `ii` not `i`
        assert(i == j);
        return (i, ii);
    }

    function b() public view returns (uint256, uint256) {
        return a();
    }
}
