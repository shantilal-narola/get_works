class Admin::FreelancersController < Admin::BaseController
	before_action :set_freelancer , only: [:show,:edit, :destroy , :update ]

	def index
		@admin_freelancers = Freelancer.all
	end 

	def new
		@admin_freelancer = Freelancer.new	
	end

	def create
		@admin_freelancer = Freelancer.new(admin_freelancer_params)
		if @admin_freelancer.save
			redirect_to admin_freelancers_path,:notice => "Freelancer is succefully created."
		else
			flash[:errors] = @admin_freelancer.errors.full_messages
			render :new 
		end	
	end 

	def show
	end

	def edit
	end

	def update 
		if @admin_freelancer.update_attributes(admin_freelancer_params)
			redirect_to admin_freelancers_path , :notice => "Freelancer is succefully updated."
		else
			render :edit
		end
	end 

	def destroy
		if @admin_freelancer.destroy
			redirect_to admin_freelancers_path , :notice => "Freelancer is succefully destroy."
		end
	end 

	private
	def set_freelancer
		@admin_freelancer = Freelancer.find(params[:id])
	end 

	def admin_freelancer_params
		params.require(:freelancer).permit(:first_name , :last_name , :email , :contact_num , :sky_id , :password , :password_confirmation,:avatar)
	end

end