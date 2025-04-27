// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Simplified Student Points Contract
 * @dev Manage student points with basic functionality
 */
contract StudentPointsContract {
    // Contract owner address
    address public owner;

    // Student structure
    struct Student {
        uint256 id;            // User ID
        string username;       // Username
        string major;          // Major
        string grade;          // Grade
        string class;          // Class      
        uint256 points;        // Student points
        uint256 created_at;    // Creation time
        bool exists;           // Whether it exists
    }

    // Mapping from ID to student information
    mapping(uint256 => Student) public students;

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Modifier: only the contract owner can call
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    /**
     * @dev Set student points
     * @param _id Student ID
     * @param _username Student username
     * @param _major Student major
     * @param _grade Student grade
     * @param _class Student class
     * @param _points Points amount
     */
    function setStudentPoints(
        uint256 _id, 
        string memory _username, 
        string memory _major, 
        string memory _grade, 
        string memory _class, 
        uint256 _points
    ) public onlyOwner {
        // If the student does not exist, create a default student
        if (!students[_id].exists) {
            students[_id] = Student({
                id: _id,
                username: _username,
                major: _major,
                grade: _grade,
                class: _class,
                points: _points,
                created_at: block.timestamp,
                exists: true
            });
        } else {
            // Update existing student's information
            students[_id].username = _username;
            students[_id].major = _major;
            students[_id].grade = _grade;
            students[_id].class = _class;
            students[_id].points = _points;
        }
    }

    /**
     * @dev Get student points
     * @param _id Student ID
     * @return Student points
     */
    function getStudentPoints(uint256 _id) public view returns (uint256) {
        require(students[_id].exists, "Student does not exist");
        return students[_id].points;
    }
}