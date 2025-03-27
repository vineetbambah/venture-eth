pragma solidity ^0.8.19;

contract Crowdfunding {
    struct Project {
        address payable creator;
        string title;
        string description;
        uint256 goal;
        uint256 currentAmount;
        uint256 deadline;
        bool completed;
        mapping(address => uint256) contributions;
    }

    // Project ID counter
    uint256 public projectCount = 0;
    
    // Mapping from project ID to Project
    mapping(uint256 => Project) public projects;
    
    // Events
    event ProjectCreated(
        uint256 projectId,
        address creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    
    event ProjectFunded(
        uint256 projectId,
        address funder,
        uint256 amount
    );
    
    event ProjectCompleted(
        uint256 projectId,
        uint256 totalAmount
    );
    
    event FundsWithdrawn(
        uint256 projectId,
        address creator,
        uint256 amount
    );

    // Create a new crowdfunding project
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _deadline
    ) public {
        // Validate inputs
        require(_goal > 0, "Goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        projectCount++;
        Project storage newProject = projects[projectCount];
        
        newProject.creator = payable(msg.sender);
        newProject.title = _title;
        newProject.description = _description;
        newProject.goal = _goal;
        newProject.currentAmount = 0;
        newProject.deadline = _deadline;
        newProject.completed = false;
        
        emit ProjectCreated(
            projectCount,
            msg.sender,
            _title,
            _goal,
            _deadline
        );
    }
    
    // Fund a project
    function fundProject(uint256 _projectId) public payable {
        Project storage project = projects[_projectId];
        
        // Validate project
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        require(block.timestamp < project.deadline, "Project funding period has ended");
        require(!project.completed, "Project has been completed");
        require(msg.value > 0, "Funding amount must be greater than 0");
        
        // Update project
        project.contributions[msg.sender] += msg.value;
        project.currentAmount += msg.value;
        
        // Check if goal is reached
        if (project.currentAmount >= project.goal) {
            project.completed = true;
            emit ProjectCompleted(_projectId, project.currentAmount);
        }
        
        emit ProjectFunded(_projectId, msg.sender, msg.value);
    }
    
    // Withdraw funds (only creator can withdraw if goal is reached or deadline passed)
    function withdrawFunds(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        
        // Validate
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        require(msg.sender == project.creator, "Only the creator can withdraw funds");
        require(
            project.completed || block.timestamp > project.deadline,
            "Cannot withdraw before deadline unless goal is reached"
        );
        require(project.currentAmount > 0, "No funds to withdraw");
        
        uint256 amount = project.currentAmount;
        project.currentAmount = 0;
        project.completed = true;
        
        // Transfer funds to creator
        project.creator.transfer(amount);
        
        emit FundsWithdrawn(_projectId, msg.sender, amount);
    }
    
    // Get contribution amount for a specific user to a project
    function getContribution(uint256 _projectId, address _contributor) public view returns (uint256) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        return projects[_projectId].contributions[_contributor];
    }
    
    // Get project details
    function getProjectDetails(uint256 _projectId) public view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 currentAmount,
        uint256 deadline,
        bool completed
    ) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        
        return (
            project.creator,
            project.title,
            project.description,
            project.goal,
            project.currentAmount,
            project.deadline,
            project.completed
        );
    }
}

